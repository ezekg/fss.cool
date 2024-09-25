import { StrictMode } from "react";
import { type Repo } from "~/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  RepoChart,
  RepoTable,
} from "~/components";

export type AppProps = {
  repos: Repo[];
};

export const App: React.FC<AppProps> = ({ repos }) => {
  return (
    <StrictMode>
      <Card>
        <CardHeader>
          <CardTitle>
            Is{" "}
            <a href="https://fair.io" rel="noopener" target="_blank">
              Fair Source
            </a>{" "}
            Cool Yet?
          </CardTitle>
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
        <CardFooter className="h-[300px] overflow-y-auto">
          <RepoTable repos={repos} />
        </CardFooter>
      </Card>
    </StrictMode>
  );
};
