import { EmitterWebhookEvent } from "@octokit/webhooks";
import { WebhookEventMap } from "@octokit/webhooks-types";
import { IssuePullPayload } from "../types";

export const issuePull = (event: EmitterWebhookEvent):  IssuePullPayload | undefined => {
  if (!("pull_request" in event.payload) && !("issue" in event.payload)) {
    return
  }
  return (event.payload as WebhookEventMap["issues"] | WebhookEventMap["pull_request"]);
}
