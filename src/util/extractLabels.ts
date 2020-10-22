import { Context } from "probot";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

export const NAME = "extractLabels";

export function extractLabels(context: Context) {
  const PRorISSUE = context.payload.issue || context.payload.pull_request;
  return (PRorISSUE?.labels as WebhookPayloadIssuesIssue["labels"]) || [];
}
