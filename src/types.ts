import { WebhookEventMap } from '@octokit/webhooks-types'

export type IssuePayload = WebhookEventMap['issues']
export type IssueCommentPayload = WebhookEventMap['issue_comment']
export type PullPayload = WebhookEventMap['pull_request']
export type ReleasePayload = WebhookEventMap['release']
export type IssuePullPayload = IssuePayload | PullPayload | IssueCommentPayload
export type WorkflowRunPayload = WebhookEventMap['workflow_run']

export const PayloadIsIssue = (payload: IssuePullPayload) => 'issue' in payload
export const PayloadIsPull = (payload: IssuePullPayload) =>
  'pull_request' in payload
