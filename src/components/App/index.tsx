import { type FC, StrictMode } from "react";
import { type JsonRepo } from "~/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
      <Mode />
      <Card>
        <CardHeader>
          <CardTitle>Is Fair Source Cool Yet?</CardTitle>
          <CardDescription>
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepoChart repos={repos} />
        </CardContent>
        <CardFooter className="h-[400px] overflow-y-auto">
          <RepoTable repos={repos} />
        </CardFooter>
      </Card>
    </StrictMode>
  );
};
