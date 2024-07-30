import { IssuePullPayload } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'

import * as Sentry from '@sentry/browser'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  console.debug('DebugPlugin', {
    extractOwnerRepo: extractOwnerRepo(payload),
    payload: payload,
  })
  Sentry.captureMessage('DebugPlugin')
}
