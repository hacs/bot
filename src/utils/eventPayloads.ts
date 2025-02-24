import { EmitterWebhookEvent } from '@octokit/webhooks'
import { WebhookEventMap } from '@octokit/webhooks-types'
import {
  IssuePullPayload,
  ReleasePayload,
  WorkflowJobPayload,
  WorkflowRunPayload,
} from '../types'

export const issuePull = (
  event: EmitterWebhookEvent,
): IssuePullPayload | undefined => {
  if (!('pull_request' in event.payload) && !('issue' in event.payload)) {
    return
  }
  return event.payload as
    | WebhookEventMap['issues']
    | WebhookEventMap['pull_request']
}

export const release = (
  event: EmitterWebhookEvent,
): ReleasePayload | undefined => {
  if ('release' in event.payload) {
    return event.payload as WebhookEventMap['release']
  }
  return
}

export const workflowRun = (
  event: EmitterWebhookEvent,
): WorkflowRunPayload | undefined => {
  if ('workflow_run' in event.payload) {
    return event.payload as WebhookEventMap['workflow_run']
  }
  return
}

export const workflowJob = (
  event: EmitterWebhookEvent,
): WorkflowJobPayload | undefined => {
  if ('workflow_job' in event.payload) {
    return event.payload as WebhookEventMap['workflow_job']
  }
  return
}
