import { Label } from '@octokit/webhooks-types'
import { IssuePullPayload } from '../types'

export const extractLabels = (payload: IssuePullPayload): Label[] => {
  if ('issue' in payload) {
    return payload.issue.labels || []
  }
  return payload.pull_request.labels || []
}
