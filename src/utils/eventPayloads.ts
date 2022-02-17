import { EmitterWebhookEvent } from '@octokit/webhooks'
import { WebhookEventMap } from '@octokit/webhooks-types'
import { IssuePullPayload, ReleasePayload, CheckSuitePayload } from '../types'

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

export const checkSuite = (
  event: EmitterWebhookEvent,
): CheckSuitePayload | undefined => {
  if ('check_suite' in event.payload && 'pull_requests' in event.payload) {
    return event.payload as WebhookEventMap['check_suite']
  }
  return
}
