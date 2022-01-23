import { EmitterWebhookEvent } from "@octokit/webhooks";

import {issuePull} from "./issuePull"

export interface orgrepo {
  org?: string;
  repo?: string;
}

export const extractOrgRepo = (event: EmitterWebhookEvent): orgrepo | undefined => {
  const payload = issuePull(event)
  if (!payload) {
    return
  }

  const repository = payload.repository.full_name;
  return {
    org: repository.split("/")[0],
    repo: repository.split("/")[1],
  } as orgrepo;
}
