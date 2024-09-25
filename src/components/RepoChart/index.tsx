import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type Repo, License } from "~/lib/types";
import { format, parseISO, eachDayOfInterval, subDays } from "date-fns";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const DATE_FORMAT = "yyyy-MM-dd";

const config: ChartConfig = {
  "fsl-1-0": {
    label: License.FSL1x0,
    color: "var(--caribbean-current)",
  },
  "fsl-1-1": {
    label: License.FSL1x1,
    color: "var(--orange-crayola)",
  },
  "fcl-1-0": {
    label: License.FCL1x0,
    color: "var(--atomic-tangerine)",
  },
  busl: {
    label: License.BUSL,
    color: "var(--slate-gray)",
  },
};

export type RepoChartProps = {
  repos: Repo[];
};

export const RepoChart: React.FC<RepoChartProps> = ({ repos }) => {
  const sortedRepos = repos
    .map((repo) => ({
      ...repo,
      fss_at: parseISO(repo.fss_at),
      oss_at: parseISO(repo.oss_at),
    }))
    .sort((a, b) => a.fss_at.getTime() - b.fss_at.getTime()); // asc

  // determine the full date range
  const startDate = sortedRepos.length
    ? subDays(sortedRepos[0].fss_at, 3)
    : new Date();
  const endDate = sortedRepos.length
    ? sortedRepos[sortedRepos.length - 1].fss_at
    : new Date();

  // fill in missing dates with zero values
  const allDates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const initialData = allDates.map((date) => ({
    date: format(date, DATE_FORMAT),
    [License.FSL1x0]: 0,
    [License.FSL1x1]: 0,
    [License.FCL1x0]: 0,
    [License.BUSL]: 0,
  }));

  // populate the data with repo info and accumulate license adoption
  const data = sortedRepos.reduce((acc: any, repo) => {
    const dateKey = format(repo.fss_at, DATE_FORMAT);
    const dataPoint = acc.find((d: any) => d.date === dateKey);

    if (dataPoint) {
      dataPoint[repo.license_fss]++;
    }

    return acc;
  }, initialData);

  // ensure accumulated counts for each day
  const cumulativeData = data.reduce(
    (acc: any[], current: any, index: number) => {
      const prev = acc[index - 1] || {
        [License.FSL1x0]: 0,
        [License.FSL1x1]: 0,
        [License.FCL1x0]: 0,
        [License.BUSL]: 0,
      };

      acc.push({
        date: current.date,
        [License.FSL1x0]: prev[License.FSL1x0] + current[License.FSL1x0],
        [License.FSL1x1]: prev[License.FSL1x1] + current[License.FSL1x1],
        [License.FCL1x0]: prev[License.FCL1x0] + current[License.FCL1x0],
        [License.BUSL]: prev[License.BUSL] + current[License.BUSL],
      });

      return acc;
    },
    [],
  );

  return (
    <ChartContainer config={config} className="max-h-[400px] w-full">
      <AreaChart data={cumulativeData} accessibilityLayer>
        {/* <CartesianGrid syncWithTicks={true} /> */}
        {/* <YAxis
          // tickLine={false}
          // axisLine={false}
          tickCount={10}
          // tickMargin={0}
          // minTickGap={0}
        /> */}
        <XAxis
          dataKey="date"
          // tickLine={false}
          // axisLine={false}
          tickCount={4}
          // tickMargin={8}
          minTickGap={32}
          tickFormatter={(t) => format(parseISO(t), DATE_FORMAT)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey={License.FSL1x0}
          type="monotone"
          fill="var(--color-fsl-1-0)"
          stroke="var(--color-fsl-1-0)"
          stackId="a"
        />
        <Area
          dataKey={License.FSL1x1}
          type="monotone"
          fill="var(--color-fsl-1-1)"
          stroke="var(--color-fsl-1-1)"
          stackId="a"
        />
        <Area
          dataKey={License.FCL1x0}
          type="monotone"
          fill="var(--color-fcl-1-0)"
          stroke="var(--color-fcl-1-0)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
};
