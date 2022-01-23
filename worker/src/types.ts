import { WebhookEventMap } from "@octokit/webhooks-types";

export type IssuePullPayload = WebhookEventMap["issues"] | WebhookEventMap["pull_request"]