import { type FC, StrictMode } from "react";
import { type JsonRepo } from "~/lib/types";
import { formatISO } from "date-fns";
import { RepoChart, RepoTable, Mode } from "~/components";

export type AppProps = {
  updatedAt: Date;
  repos: JsonRepo[];
};

export const App: FC<AppProps> = ({ updatedAt, repos }) => {
  return (
    <StrictMode>
      <div className="flex min-h-screen w-full flex-col">
        <header className="top-0 z-10 items-center gap-1 border-b bg-background">
          <div className="flex mx-auto w-full max-w-[1080px] p-4">
            <div className="mr-8">
              <h1 className="text-2xl text-pretty font-semibold tracking-tight">
                Is Fair Source Cool Yet? 😎
              </h1>
              <p className="text-sm text-pretty text-muted-foreground">
                Showing adoption of{" "}
                <a
                  className="underline"
                  href="https://fair.io"
                  rel="noopener"
                  target="_blank"
                >
                  Fair Source
                </a>{" "}
                licenses over time
              </p>
            </div>
            <div className="flex items-center ml-auto text-sm">
              <Mode />
            </div>
          </div>
        </header>
        <main className="items-center gap-1">
          <div className="h-1/2 border-b">
            <RepoChart repos={repos} />
          </div>
          <div className="flex flex-1 flex-col mx-auto w-full max-w-[1080px] py-4">
            <RepoTable repos={repos} />
          </div>
        </main>
        <footer className="align-bottom mt-auto">
          <div className="flex flex-1 flex-col mx-auto w-full max-w-[1080px] p-4">
            <div className="w-full mb-2 md:flex">
              <p className="text-sm text-muted flex-grow md:w-1/2">
                Last updated: {formatISO(updatedAt)} (updated weekly)
              </p>
              <p className="text-sm text-muted md:text-right md:w-1/2">
                Find an issue?{" "}
                <a
                  className="underline"
                  href="https://github.com/ezekg/fss.cool"
                  rel="noopener"
                  target="_blank"
                >
                  Open a PR.
                </a>
              </p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              ❤️{" "}
              <a href="https://x.com/_m27e" rel="noopener" target="_blank">
                @_m27e
              </a>
            </p>
          </div>
        </footer>
      </div>
    </StrictMode>
  );
};
