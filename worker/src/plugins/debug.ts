import { App } from "octokit";
import { IssuePullPayload } from "../types";

import { extractOrgRepo } from "../utils/extractOrgRepo";

export default async (app: App, payload: IssuePullPayload): Promise<void> => {
  console.debug("DebugPlugin", {
    extractOrgRepo: extractOrgRepo(payload),
    payload: payload
  });
}
