import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { type Repo } from "~/lib/types";
import { format, eachDayOfInterval, subDays } from "date-fns";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const DATE_FORMAT = "yyyy-MM-dd";

const config: ChartConfig = {
  "fsl-1-0": {
    label: "FSL-1.0",
    color: "var(--caribbean-current)",
  },
  "fsl-1-1": {
    label: "FSL-1.1",
    color: "var(--orange-crayola)",
  },
  "fcl-1-0": {
    label: "FCL-1.0",
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
      fss_at: new Date(repo.fss_at),
      oss_at: new Date(repo.oss_at),
    }))
    .sort((a, b) => a.fss_at.getTime() - b.fss_at.getTime());

  // determine the full date range
  const startDate = sortedRepos.length
    ? subDays(new Date(sortedRepos[0].fss_at), 3)
    : new Date();
  const endDate = sortedRepos.length
    ? new Date(sortedRepos[sortedRepos.length - 1].fss_at)
    : new Date();

  // fill in missing dates with zero values
  const allDates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const initialData = allDates.map((date) => ({
    date: format(date, DATE_FORMAT),
    "FSL-1.0": 0,
    "FSL-1.1": 0,
    "FCL-1.0": 0,
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
        "FSL-1.0": 0,
        "FSL-1.1": 0,
        "FCL-1.0": 0,
      };

      acc.push({
        date: current.date,
        "FSL-1.0": prev["FSL-1.0"] + current["FSL-1.0"],
        "FSL-1.1": prev["FSL-1.1"] + current["FSL-1.1"],
        "FCL-1.0": prev["FCL-1.0"] + current["FCL-1.0"],
      });

      return acc;
    },
    [],
  );

  return (
    <ChartContainer config={config}>
      <AreaChart
        accessibilityLayer
        data={cumulativeData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tickFormatter={(t) => format(new Date(t), DATE_FORMAT)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="FSL-1.0"
          type="monotone"
          fill="var(--color-fsl-1-0)"
          fillOpacity={0.4}
          stroke="var(--color-fsl-1-0)"
          stackId="a"
        />
        <Area
          dataKey="FSL-1.1"
          type="monotone"
          fill="var(--color-fsl-1-1)"
          fillOpacity={0.4}
          stroke="var(--color-fsl-1-1)"
          stackId="a"
        />
        <Area
          dataKey="FCL-1.0"
          type="monotone"
          fill="var(--color-fcl-1-0)"
          fillOpacity={0.4}
          stroke="var(--color-fcl-1-0)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
};
