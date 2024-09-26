import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type FC, type HTMLAttributes } from "react";
import {
  type JsonRepo,
  type Repo,
  FairSourceLicenseIdentifier,
} from "~/lib/types";
import { format, parseISO, eachDayOfInterval, subDays } from "date-fns";
import { cn } from "~/lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const DATE_FORMAT = "yyyy-MM-dd";

const config: ChartConfig = {
  "fsl-1-0": {
    label: FairSourceLicenseIdentifier.FSL1x0,
    color: "hsl(var(--chart-1))",
  },
  "fsl-1-1": {
    label: FairSourceLicenseIdentifier.FSL1x1,
    color: "hsl(var(--chart-2))",
  },
  "fcl-1-0": {
    label: FairSourceLicenseIdentifier.FCL1x0,
    color: "hsl(var(--chart-3))",
  },
  busl: {
    label: FairSourceLicenseIdentifier.BUSL,
    color: "hsl(var(--chart-4))",
  },
};

export type RepoChartProps = HTMLAttributes<HTMLDivElement> & {
  repos: JsonRepo[];
};

export const RepoChart: FC<RepoChartProps> = ({ className, repos }) => {
  const sortedRepos: Repo[] = repos
    .map(
      (repo: JsonRepo): Repo =>
        ({
          ...repo,
          fss_at: parseISO(repo.fss_at),
          oss_at: parseISO(repo.oss_at),
        }) as Repo,
    )
    .sort((a, b) => a.fss_at.getTime() - b.fss_at.getTime()); // asc

  // determine the full date range
  const startDate = subDays(sortedRepos[0].fss_at, 3);
  const endDate = sortedRepos[sortedRepos.length - 1].fss_at;

  // fill in missing dates with zero values
  const allDates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const initialData = allDates.map((date) => ({
    date: format(date, DATE_FORMAT),
    [FairSourceLicenseIdentifier.FSL1x0]: 0,
    [FairSourceLicenseIdentifier.FSL1x1]: 0,
    [FairSourceLicenseIdentifier.FCL1x0]: 0,
    [FairSourceLicenseIdentifier.BUSL]: 0,
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
        [FairSourceLicenseIdentifier.FSL1x0]: 0,
        [FairSourceLicenseIdentifier.FSL1x1]: 0,
        [FairSourceLicenseIdentifier.FCL1x0]: 0,
        [FairSourceLicenseIdentifier.BUSL]: 0,
      };

      acc.push({
        date: current.date,
        [FairSourceLicenseIdentifier.FSL1x0]:
          prev[FairSourceLicenseIdentifier.FSL1x0] +
          current[FairSourceLicenseIdentifier.FSL1x0],
        [FairSourceLicenseIdentifier.FSL1x1]:
          prev[FairSourceLicenseIdentifier.FSL1x1] +
          current[FairSourceLicenseIdentifier.FSL1x1],
        [FairSourceLicenseIdentifier.FCL1x0]:
          prev[FairSourceLicenseIdentifier.FCL1x0] +
          current[FairSourceLicenseIdentifier.FCL1x0],
        [FairSourceLicenseIdentifier.BUSL]:
          prev[FairSourceLicenseIdentifier.BUSL] +
          current[FairSourceLicenseIdentifier.BUSL],
      });

      return acc;
    },
    [],
  );

  return (
    <ChartContainer
      config={config}
      className={cn("max-h-[400px] w-full", className)}
    >
      <AreaChart
        data={cumulativeData}
        margin={{ left: 0, right: 0 }}
        accessibilityLayer
      >
        <CartesianGrid syncWithTicks={true} />
        <YAxis tickCount={32} hide={true} />
        <XAxis
          dataKey="date"
          tickFormatter={(t) => format(parseISO(t), DATE_FORMAT)}
          tickCount={4}
          hide={true}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey={FairSourceLicenseIdentifier.FSL1x0}
          type="monotone"
          fill="var(--color-fsl-1-0)"
          stroke="var(--color-fsl-1-0)"
          stackId="a"
        />
        <Area
          dataKey={FairSourceLicenseIdentifier.FSL1x1}
          type="monotone"
          fill="var(--color-fsl-1-1)"
          stroke="var(--color-fsl-1-1)"
          stackId="a"
        />
        <Area
          dataKey={FairSourceLicenseIdentifier.FCL1x0}
          type="monotone"
          fill="var(--color-fcl-1-0)"
          stroke="var(--color-fcl-1-0)"
          stackId="a"
        />
        {/* <Area
          dataKey={FairSourceLicenseIdentifier.BUSL}
          type="monotone"
          fill="var(--color-busl)"
          stroke="var(--color-busl)"
          stackId="a"
        /> */}
      </AreaChart>
    </ChartContainer>
  );
};
