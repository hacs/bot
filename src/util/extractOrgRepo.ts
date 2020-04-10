import { Context } from "probot";

export const NAME = "extractOrgRepo";

export interface orgrepo {
  org?: string;
  repo?: string;
}

export function extractOrgRepo(context: Context) {
  const repository = context.payload.repository.full_name;
  return {
    org: repository.split("/")[0],
    repo: repository.split("/")[1],
  } as orgrepo;
}
