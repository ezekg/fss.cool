import { type FC, type HTMLAttributes, useState } from "react";
import { type JsonRepo, type Repo } from "~/lib/types";
import { format, parseISO } from "date-fns";
import {
  Info,
  SortAsc,
  SortDesc,
  ExternalLink,
  ChevronsUpDown,
  Clock,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const DATE_FORMAT = "yyyy-MM-dd";

enum SortOrder {
  None = "none",
  Asc = "asc",
  Desc = "desc",
}

export type RepoTableProps = HTMLAttributes<HTMLDivElement> & {
  repos: JsonRepo[];
};

export const RepoTable: FC<RepoTableProps> = ({ className, repos }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [orderByStars, setOrderByStars] = useState<SortOrder>(SortOrder.None);
  const [orderByLicense, setOrderByLicense] = useState<SortOrder>(
    SortOrder.None,
  );
  const [orderByChangeLicense, setOrderByChangeLicense] = useState<SortOrder>(
    SortOrder.None,
  );
  const [orderByAdoptedAt, setOrderByAdoptedAt] = useState<SortOrder>(
    SortOrder.Desc,
  );
  const [orderByChangeAt, setOrderByChangeAt] = useState<SortOrder>(
    SortOrder.None,
  );

  const cycleSortOrder = (currentOrder: SortOrder): SortOrder => {
    switch (currentOrder) {
      case SortOrder.None:
        return SortOrder.Desc;
      case SortOrder.Desc:
        return SortOrder.Asc;
      case SortOrder.Asc:
        return SortOrder.None;
      default:
        return SortOrder.None;
    }
  };

  const toggleIsCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleOrderByStars = () => {
    setOrderByStars(cycleSortOrder(orderByStars));
  };

  const toggleOrderByLicense = () => {
    setOrderByLicense(cycleSortOrder(orderByLicense));
  };

  const toggleOrderByChangeLicense = () => {
    setOrderByChangeLicense(cycleSortOrder(orderByChangeLicense));
  };

  const toggleOrderByAdoptedAt = () => {
    setOrderByAdoptedAt(cycleSortOrder(orderByAdoptedAt));
  };

  const toggleOrderByChangeAt = () => {
    setOrderByChangeAt(cycleSortOrder(orderByChangeAt));
  };

  const data: Repo[] = repos.map(
    (repo: JsonRepo): Repo =>
      ({
        ...repo,
        fss_at: parseISO(repo.fss_at),
        oss_at: parseISO(repo.oss_at),
      }) as Repo,
  );

  // FIXME(ezekg) these don't always play nicely together
  if (orderByChangeAt !== SortOrder.None) {
    data.sort(
      (a, b) =>
        (a.oss_at.getTime() - b.oss_at.getTime()) *
        (orderByChangeAt === SortOrder.Desc ? -1 : 1),
    );
  }

  if (orderByAdoptedAt !== SortOrder.None) {
    data.sort(
      (a, b) =>
        (a.fss_at.getTime() - b.fss_at.getTime()) *
        (orderByAdoptedAt === SortOrder.Desc ? -1 : 1),
    );
  }

  if (orderByChangeLicense !== SortOrder.None) {
    data.sort(
      (a, b) =>
        (a.license_oss > b.license_oss ? 1 : -1) *
        (orderByChangeLicense === SortOrder.Desc ? -1 : 1),
    );
  }

  if (orderByLicense !== SortOrder.None) {
    data.sort(
      (a, b) =>
        (a.license_fss > b.license_fss ? 1 : -1) *
        (orderByLicense === SortOrder.Desc ? -1 : 1),
    );
  }

  if (orderByStars !== SortOrder.None) {
    data.sort(
      (a, b) =>
        (a.repo_stars > b.repo_stars ? 1 : -1) *
        (orderByStars === SortOrder.Desc ? -1 : 1),
    );
  }

  let visible: Repo[] = [...data];
  if (isCollapsed) {
    visible = visible.slice(0, 10);
  }

  return (
    <TooltipProvider>
      <Table className={cn("relative", className)}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[99%] whitespace-nowrap">
              Repository
            </TableHead>
            <TableHead className="whitespace-nowrap">
              Stars
              <span
                onClick={toggleOrderByStars}
                className="inline-block cursor-pointer"
              >
                {orderByStars === SortOrder.None ? (
                  <SortDesc className="relative inline text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByStars === SortOrder.Desc ? (
                  <SortDesc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByStars === SortOrder.Asc ? (
                  <SortAsc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : null}
              </span>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              License
              <span
                onClick={toggleOrderByLicense}
                className="inline-block cursor-pointer"
              >
                {orderByLicense === SortOrder.None ? (
                  <SortDesc className="relative inline text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByLicense === SortOrder.Desc ? (
                  <SortDesc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByLicense === SortOrder.Asc ? (
                  <SortAsc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : null}
              </span>
            </TableHead>
            <TableHead className="relative whitespace-nowrap">
              Change License
              <Tooltip>
                <TooltipTrigger>
                  <Info className="relative inline cursor-pointer pointer-events-auto w-[14px] h-[14px] top-[-1px] ml-1" />
                </TooltipTrigger>
                <TooltipContent className="w-fit min-w-[120px] max-w-[280px] whitespace-normal">
                  <p className="text-xs">
                    The Open Source license that the project will eventually
                    transition to under{" "}
                    <a
                      href="https://opensource.org/dosp"
                      rel="noopener"
                      target="_blank"
                      className="underline"
                    >
                      DOSP
                    </a>
                    .
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                onClick={toggleOrderByChangeLicense}
                className="inline-block cursor-pointer"
              >
                {orderByChangeLicense === SortOrder.None ? (
                  <SortDesc className="relative inline text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByChangeLicense === SortOrder.Desc ? (
                  <SortDesc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByChangeLicense === SortOrder.Asc ? (
                  <SortAsc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : null}
              </span>
            </TableHead>
            <TableHead className="relative whitespace-nowrap">
              Adopted On
              <Tooltip>
                <TooltipTrigger>
                  <Info className="relative inline cursor-pointer pointer-events-auto w-[14px] h-[14px] top-[-1px] ml-1" />
                </TooltipTrigger>
                <TooltipContent className="w-fit min-w-[120px] max-w-[280px] whitespace-normal">
                  <p className="text-xs">
                    When the project first adopted a Fair Source license (or
                    best estimate based on the project's commit history).
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                onClick={toggleOrderByAdoptedAt}
                className="inline-block cursor-pointer"
              >
                {orderByAdoptedAt === SortOrder.None ? (
                  <SortDesc className="relative inline text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByAdoptedAt === SortOrder.Desc ? (
                  <SortDesc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByAdoptedAt === SortOrder.Asc ? (
                  <SortAsc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : null}
              </span>
            </TableHead>
            <TableHead className="relative whitespace-nowrap">
              Change On
              <Tooltip>
                <TooltipTrigger>
                  <Info className="relative inline cursor-pointer pointer-events-auto w-[14px] h-[14px] top-[-1px] ml-1" />
                </TooltipTrigger>
                <TooltipContent className="w-fit min-w-[120px] max-w-[280px] whitespace-normal">
                  <p className="text-xs">
                    When the project's first Open Source version will be
                    released under the Change License, assuming a standard
                    2-year delay.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                onClick={toggleOrderByChangeAt}
                className="inline-block cursor-pointer"
              >
                {orderByChangeAt === SortOrder.None ? (
                  <SortDesc className="relative inline text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByChangeAt === SortOrder.Desc ? (
                  <SortDesc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : orderByChangeAt === SortOrder.Asc ? (
                  <SortAsc className="relative inline w-[14px] h-[14px] top-[-1px] ml-1" />
                ) : null}
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((repo) => (
            <TableRow key={repo.repo_id}>
              <TableCell className="w-[99%] font-bold whitespace-nowrap">
                <a href={repo.repo_url} rel="noopener" target="_blank">
                  {repo.repo_org}/{repo.repo_name}{" "}
                  <ExternalLink className="inline relative text-muted w-[14px] h-[14px] top-[-2px] ml-1" />
                </a>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {repo.repo_stars != null ? (
                  repo.repo_stars.toLocaleString("en-US")
                ) : (
                  <span className="text-muted">N/A</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <a href={repo.license_url} rel="noopener" target="_blank">
                  {repo.license_fss}{" "}
                  <ExternalLink className="inline relative text-muted w-[14px] h-[14px] top-[-2px] ml-1" />
                </a>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {repo.license_oss}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {format(repo.fss_at, DATE_FORMAT)}{" "}
                <Tooltip>
                  <TooltipTrigger>
                    <Clock className="inline relative text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                  </TooltipTrigger>
                  <TooltipContent className="w-fit min-w-[120px] max-w-[280px] whitespace-normal">
                    <p className="text-xs">{repo.fss_at.toISOString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {format(repo.oss_at, DATE_FORMAT)}{" "}
                <Tooltip>
                  <TooltipTrigger>
                    <Clock className="inline relative text-muted w-[14px] h-[14px] top-[-1px] ml-1" />
                  </TooltipTrigger>
                  <TooltipContent className="w-fit min-w-[120px] max-w-[280px] whitespace-normal">
                    <p className="text-xs">{repo.oss_at.toISOString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="w-full flex items-center p-4">
        <p className="flex-grow text-sm text-muted-foreground">
          Showing {visible.length}/{data.length} repositories
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 p-0"
          title={isCollapsed ? "Show more" : "Show less"}
          onClick={toggleIsCollapsed}
        >
          <ChevronsUpDown className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </Button>
      </div>
    </TooltipProvider>
  );
};
