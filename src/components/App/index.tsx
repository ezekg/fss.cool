import { type FC, StrictMode } from "react";
import { type JsonRepo } from "~/lib/types";
import {
  RepoChart,
  RepoTable,
  Mode,
} from "~/components";

export type AppProps = {
  repos: JsonRepo[];
};

export const App: FC<AppProps> = ({ repos }) => {
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
          <div className="flex flex-1 flex-col mx-auto w-full max-w-[1080px] p-4">
            <RepoTable repos={repos} />
          </div>
        </main>
      </div>
    </StrictMode>
  );
};
