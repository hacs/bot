import { IssuePullPayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { GitHubBot } from '../github.bot'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  bot.sentry.captureMessage('DebugPlugin')
  console.debug('DebugPlugin', {
    extractOwnerRepo: extractOwnerRepo(payload),
    payload: payload,
  })
}
