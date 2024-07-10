import { IssuePullPayload, PayloadIsIssue } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !PayloadIsIssue(payload) ||
    payload.action !== 'labeled' ||
    payload.label?.name !== 'invalid'
  ) {
    return
  }

  await bot.github.octokit.rest.issues.update({
    ...extractOwnerRepo(payload),
    issue_number: payload.issue.number,
    state: 'closed',
    state_reason: 'not_planned',
    labels: ['invalid'],
  })
}
