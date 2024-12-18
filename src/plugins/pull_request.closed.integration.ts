import { IssuePullPayload, PayloadIsPull } from '../types'

import { GitHubBot } from '../github.bot'
import { RepositoryName } from '../const'
import { getNextMilestone } from '../utils/nextMilestone'
import { senderIsBot } from '../utils/filter'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'

const SKIP_LABELS = new Set(['pr: dependency-update'])

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !PayloadIsPull(payload) ||
    payload.action !== 'closed' ||
    payload.repository.name !== RepositoryName.INTEGRATION
  ) {
    return
  }

  const { data: pull } = await bot.github.octokit.rest.pulls.get({
    ...extractOwnerRepo(payload),
    pull_number: payload.pull_request.number,
  })

  if (!pull.merged) {
    console.debug('Did not merge')
    return
  }

  if (pull.labels.some((label) => SKIP_LABELS.has(label.name))) {
    console.debug('Skipping due to label')
    return
  }

  const nextMilestone = await getNextMilestone(bot.github)
  if (nextMilestone) {
    await bot.github.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      milestone: nextMilestone.number,
    })
  }
}
