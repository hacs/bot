import { WebhookEventMap } from "@octokit/webhooks-types";

export type IssuePayload = WebhookEventMap["issues"]
export type PullPayload = WebhookEventMap["pull_request"]
export type IssuePullPayload = IssuePayload | PullPayload