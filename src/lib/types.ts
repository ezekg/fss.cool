import { repos } from "~/data/repos.json";

export type Repo = (typeof repos)[0];

export enum License {
  FSL1x0 = 'FSL-1.0',
  FSL1x1 = 'FSL-1.1',
  FCL1x0 = 'FCL-1.0',
  BUSL = 'BUSL'
}
