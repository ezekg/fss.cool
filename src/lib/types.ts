import { type RestEndpointMethodTypes } from "@octokit/rest";

export enum OpenSourceLicenseIdentifier {
  Apache2x0 = "Apache-2.0",
  MIT = "MIT",
}

export enum FairSourceLicenseIdentifier {
  FSL1x0 = "FSL-1.0",
  FSL1x1 = "FSL-1.1",
  FCL1x0 = "FCL-1.0",
  BUSL = "BUSL",
}

export enum SpdxLicenseIdentifier {
  FSL1x0Apache2x0 = "FSL-1.0-Apache-2.0",
  FSL1x0MIT = "FSL-1.0-MIT",
  FSL1x1Apache2x0 = "FSL-1.1-Apache-2.0",
  FSL1x1MIT = "FSL-1.1-MIT",
  FCL1x0Apache2x0 = "FCL-1.0-Apache-2.0",
  FCL1x0MIT = "FCL-1.0-MIT",
  BUSL = "BUSL",
}

export type SearchResult =
  RestEndpointMethodTypes["search"]["code"]["response"]["data"]["items"][0];

export type LicenseIdentifierTuple = [
  FairSourceLicenseIdentifier,
  OpenSourceLicenseIdentifier,
];

export type LicenseIdentifierTuples = LicenseIdentifierTuple[];

export interface JsonRepo {
  repo_id: number;
  repo_org: string;
  repo_name: string;
  repo_url: string;
  repo_stars: number;
  license_url: string;
  license_spdx: string;
  license_fss: string;
  license_oss: string;
  fss_at: string;
  oss_at: string;
}

export interface Repo {
  repo_id: number;
  repo_org: string;
  repo_name: string;
  repo_url: string;
  repo_stars: number;
  license_url: string;
  license_spdx: SpdxLicenseIdentifier;
  license_fss: FairSourceLicenseIdentifier;
  license_oss: OpenSourceLicenseIdentifier;
  fss_at: Date;
  oss_at: Date;
}
