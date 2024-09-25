import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest'
import { Octokit as OctokitCore } from '@octokit/core'
import { type RequestOptions } from '@octokit/types'
import { RequestError } from '@octokit/request-error'
import { addYears } from 'date-fns'
import * as fs from 'fs/promises'
import { version } from '../package.json'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const OSS_AFTER = 2 // years

if (!GITHUB_TOKEN) {
  console.error(`GITHUB_TOKEN is required`)

  process.exit(1)
}

enum OpenSourceLicenseIdentifier {
  Apache2x0 = 'Apache-2.0',
  MIT = 'MIT',
}

enum FairSourceLicenseIdentifier {
  FSL1x0 = 'FSL-1.0',
  FSL1x1 = 'FSL-1.1',
  FCL1x0 = 'FCL-1.0',
  BUSL = 'BUSL',
}

type SearchResult = RestEndpointMethodTypes["search"]["code"]["response"]["data"]["items"][0]
type SpdxLicenseIdentifier = `${FairSourceLicenseIdentifier}-${OpenSourceLicenseIdentifier}`
type LicenseIdentifier = [FairSourceLicenseIdentifier, OpenSourceLicenseIdentifier]
type LicenseIdentifiers = LicenseIdentifier[]

interface Repo {
  repo_id: number
  repo_org: string
  repo_name: string
  repo_url: string
  repo_stars: number
  license_url: string
  license_spdx: SpdxLicenseIdentifier
  license_fss: FairSourceLicenseIdentifier
  license_oss: OpenSourceLicenseIdentifier
  fss_at: Date
  oss_at: Date
}

function retryPlugin(octokit: OctokitCore) {
  octokit.hook.error('request', async (error: Error, options: RequestOptions) => {
    if (error instanceof RequestError && error.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
      const retryAfter = error.response.headers['retry-after'] ? parseInt(error.response.headers['retry-after'] as string, 10) : 60

      console.log(`Rate limit exceeded: retrying in ${retryAfter} seconds`)

      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))

      return octokit.request(options)
    }
    throw error
  })
}

const OctokitWithRetries = Octokit.plugin(retryPlugin)
const octokit = new OctokitWithRetries({
  auth: GITHUB_TOKEN,
  userAgent: `fss.cool v${version}`,
  throttle: {
    onRateLimit: (retryAfter: number | string, options: RequestOptions) => {
      console.log(`Request quota exhausted: request ${options.method} ${options.url}`)

      if (options.request!.retryCount <= 2) {
        console.log(`Retrying after ${retryAfter} seconds`)

        return true
      }
    },
    onAbuseLimit: (_retryAfter: number | string, options: RequestOptions) => {
      console.log(`Abuse detected: request ${options.method} ${options.url}`)
    },
  }
})

const repos = new Set<Repo>()

const paths = [
  'LICENSE.md',
  'LICENSE.txt',
  'LICENSE',
]

const licenses: LicenseIdentifiers = [
  [FairSourceLicenseIdentifier.FSL1x0, OpenSourceLicenseIdentifier.Apache2x0],
  [FairSourceLicenseIdentifier.FSL1x0, OpenSourceLicenseIdentifier.MIT],
  [FairSourceLicenseIdentifier.FSL1x1, OpenSourceLicenseIdentifier.Apache2x0],
  [FairSourceLicenseIdentifier.FSL1x1, OpenSourceLicenseIdentifier.MIT],
  [FairSourceLicenseIdentifier.FCL1x0, OpenSourceLicenseIdentifier.Apache2x0],
  [FairSourceLicenseIdentifier.FCL1x0, OpenSourceLicenseIdentifier.MIT],
]

async function main() {
  for (let license of licenses) {
    const [fssLicense, ossLicense] = license
    const spdxLicense = `${fssLicense}-${ossLicense}` as SpdxLicenseIdentifier
    const term = `${spdxLicense}`

    console.log(`Searching for FSS repos licensed under ${spdxLicense}`)

    const options = octokit.rest.search.code.endpoint.merge({
      q: term,
      per_page: 100,
    })

    for await (const response of octokit.paginate.iterator<SearchResult>(options)) {
      console.log(`Found ${response.data.length} FSS repos licensed under ${spdxLicense}`)

      for (let item of response.data) {
        if (!paths.includes(item.path)) {
          continue
        }

        const { data: [{ commit }]} = await octokit.rest.repos.listCommits({
          owner: item.repository.owner.login,
          repo: item.repository.name,
          path: item.path,
          per_page: 1,
        })

        const { data: repo } = await octokit.rest.repos.get({
          owner: item.repository.owner.login,
          repo: item.repository.name,
        })

        const adoptedAt = new Date(commit.author!.date!)
        const changeAt = addYears(adoptedAt, OSS_AFTER)

        // FIXME(ezekg) dedupe on repo name to filter oob-forks?

        repos.add({
          repo_id: repo.id,
          repo_name: repo.name,
          repo_org: repo.owner.login,
          repo_url: repo.html_url,
          repo_stars: repo.stargazers_count,
          license_url: item.html_url,
          license_spdx: spdxLicense,
          license_fss: fssLicense,
          license_oss: ossLicense,
          fss_at: adoptedAt,
          oss_at: changeAt,
        })
      }
    }
  }

  console.log(`Saving ${repos.size} FSS repos`)

  await fs.writeFile(
    'src/data/repos.json',
    JSON.stringify({ repos: Array.from(repos) }, null, 2),
    'utf-8',
  )
}

main().catch(console.error)
