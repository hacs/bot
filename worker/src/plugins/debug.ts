import { App } from "octokit";
import { EmitterWebhookEvent } from "@octokit/webhooks";

import { extractOrgRepo } from "../utils/extractOrgRepo";

export const DebugPlugin = async (app: App, event: EmitterWebhookEvent): Promise<void> => {
  console.debug("DebugPlugin", {
    extractOrgRepo: extractOrgRepo(event),
    payload: event.payload
  });
}
