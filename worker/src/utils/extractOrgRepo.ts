import { IssuePullPayload } from "../types";

export interface OrgRepo {
  org: string;
  repo: string;
}

export const extractOrgRepo = (payload: IssuePullPayload): OrgRepo  => {
  const repository = payload.repository.full_name;
  return {
    org: repository.split("/")[0],
    repo: repository.split("/")[1],
  }
}
