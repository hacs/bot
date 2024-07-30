import { IssuePullPayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { GitHubBot } from '../github.bot'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  console.debug('DebugPlugin', {
    extractOwnerRepo: extractOwnerRepo(payload),
    payload: payload,
  })
  bot.sentry.setExtras({ payload, extractOwnerRepo: extractOwnerRepo(payload) })
  bot.sentry.captureMessage('DebugPlugin')
}
