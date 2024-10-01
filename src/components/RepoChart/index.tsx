import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type FC, type HTMLAttributes } from "react";
import { type JsonRepo, type Repo, SpdxLicenseIdentifier } from "~/lib/types";
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
  "fsl-1-0-alv2": {
    label: SpdxLicenseIdentifier.FSL1x0ALv2,
    color: "hsl(var(--chart-1))",
  },
  "fsl-1-0-mit": {
    label: SpdxLicenseIdentifier.FSL1x0MIT,
    color: "hsl(var(--chart-2))",
  },
  "fsl-1-1-alv2": {
    label: SpdxLicenseIdentifier.FSL1x1ALv2,
    color: "hsl(var(--chart-3))",
  },
  "fsl-1-1-mit": {
    label: SpdxLicenseIdentifier.FSL1x1MIT,
    color: "hsl(var(--chart-4))",
  },
  "fcl-1-0-alv2": {
    label: SpdxLicenseIdentifier.FCL1x0ALv2,
    color: "hsl(var(--chart-5))",
  },
  "fcl-1-0-mit": {
    label: SpdxLicenseIdentifier.FCL1x0MIT,
    color: "hsl(var(--chart-6))",
  },
  busl: {
    label: SpdxLicenseIdentifier.BUSL,
    color: "hsl(var(--chart-7))",
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
  const endDate = new Date();

  // fill in missing dates with zero values
  const allDates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const initialData = allDates.map((date) => ({
    date: format(date, DATE_FORMAT),
    [SpdxLicenseIdentifier.FSL1x0ALv2]: 0,
    [SpdxLicenseIdentifier.FSL1x0MIT]: 0,
    [SpdxLicenseIdentifier.FSL1x1ALv2]: 0,
    [SpdxLicenseIdentifier.FSL1x1MIT]: 0,
    [SpdxLicenseIdentifier.FCL1x0ALv2]: 0,
    [SpdxLicenseIdentifier.FCL1x0MIT]: 0,
    [SpdxLicenseIdentifier.BUSL]: 0,
  }));

  // populate the data with repo info and accumulate license adoption
  const data = sortedRepos.reduce((acc: any, repo) => {
    const dateKey = format(repo.fss_at, DATE_FORMAT);
    const dataPoint = acc.find((d: any) => d.date === dateKey);

    if (dataPoint) {
      dataPoint[repo.license_spdx]++;
    }

    return acc;
  }, initialData);

  // ensure accumulated counts for each day
  const cumulativeData = data.reduce(
    (acc: any[], current: any, index: number) => {
      const prev = acc[index - 1] || {
        [SpdxLicenseIdentifier.FSL1x0ALv2]: 0,
        [SpdxLicenseIdentifier.FSL1x0MIT]: 0,
        [SpdxLicenseIdentifier.FSL1x1ALv2]: 0,
        [SpdxLicenseIdentifier.FSL1x1MIT]: 0,
        [SpdxLicenseIdentifier.FCL1x0ALv2]: 0,
        [SpdxLicenseIdentifier.FCL1x0MIT]: 0,
        [SpdxLicenseIdentifier.BUSL]: 0,
      };

      acc.push({
        date: current.date,
        [SpdxLicenseIdentifier.FSL1x0ALv2]:
          prev[SpdxLicenseIdentifier.FSL1x0ALv2] +
          current[SpdxLicenseIdentifier.FSL1x0ALv2],
        [SpdxLicenseIdentifier.FSL1x0MIT]:
          prev[SpdxLicenseIdentifier.FSL1x0MIT] +
          current[SpdxLicenseIdentifier.FSL1x0MIT],
        [SpdxLicenseIdentifier.FSL1x1ALv2]:
          prev[SpdxLicenseIdentifier.FSL1x1ALv2] +
          current[SpdxLicenseIdentifier.FSL1x1ALv2],
        [SpdxLicenseIdentifier.FSL1x1MIT]:
          prev[SpdxLicenseIdentifier.FSL1x1MIT] +
          current[SpdxLicenseIdentifier.FSL1x1MIT],
        [SpdxLicenseIdentifier.FCL1x0ALv2]:
          prev[SpdxLicenseIdentifier.FCL1x0ALv2] +
          current[SpdxLicenseIdentifier.FCL1x0ALv2],
        [SpdxLicenseIdentifier.FCL1x0MIT]:
          prev[SpdxLicenseIdentifier.FCL1x0MIT] +
          current[SpdxLicenseIdentifier.FCL1x0MIT],
        [SpdxLicenseIdentifier.BUSL]:
          prev[SpdxLicenseIdentifier.BUSL] +
          current[SpdxLicenseIdentifier.BUSL],
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
          content={
            <ChartTooltipContent className="w-[200px]" indicator="dot" />
          }
        />
        <Area
          dataKey={SpdxLicenseIdentifier.FSL1x0ALv2}
          type="monotone"
          fill="var(--color-fsl-1-0-alv2)"
          stroke="var(--color-fsl-1-0-alv2)"
          stackId="a"
        />
        <Area
          dataKey={SpdxLicenseIdentifier.FSL1x0MIT}
          type="monotone"
          fill="var(--color-fsl-1-0-mit)"
          stroke="var(--color-fsl-1-0-mit)"
          stackId="a"
        />
        <Area
          dataKey={SpdxLicenseIdentifier.FSL1x1ALv2}
          type="monotone"
          fill="var(--color-fsl-1-1-alv2)"
          stroke="var(--color-fsl-1-1-alv2)"
          stackId="a"
        />
        <Area
          dataKey={SpdxLicenseIdentifier.FSL1x1MIT}
          type="monotone"
          fill="var(--color-fsl-1-1-mit)"
          stroke="var(--color-fsl-1-1-mit)"
          stackId="a"
        />
        <Area
          dataKey={SpdxLicenseIdentifier.FCL1x0ALv2}
          type="monotone"
          fill="var(--color-fcl-1-0-alv2)"
          stroke="var(--color-fcl-1-0-alv2)"
          stackId="a"
        />
        <Area
          dataKey={SpdxLicenseIdentifier.FCL1x0MIT}
          type="monotone"
          fill="var(--color-fcl-1-0-mit)"
          stroke="var(--color-fcl-1-0-mit)"
          stackId="a"
        />
        {/* <Area
          dataKey={SpdxLicenseIdentifier.BUSL}
          type="monotone"
          fill="var(--color-busl)"
          stroke="var(--color-busl)"
          stackId="a"
        /> */}
      </AreaChart>
    </ChartContainer>
  );
};
