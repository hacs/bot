import { IssuePayload } from '../types'

import { GitHubBot } from '../github.bot'
import { RepositoryName } from '../const'
import { getNextMilestone } from '../utils/nextMilestone'
import { senderIsBot } from '../utils/filter'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'

export default async (bot: GitHubBot, payload: IssuePayload): Promise<void> => {
  if (
    senderIsBot(payload) ||
    payload.action !== 'closed' ||
    payload.repository.name !== RepositoryName.INTEGRATION
  ) {
    return
  }

  const { data: pull } = await bot.github.octokit.rest.pulls.get({
    ...extractOwnerRepo(payload),
    pull_number: payload.issue.number,
  })

  if (!pull.labels.filter((label) => label.name === 'bug').length) {
    console.debug('Not a bug')
    return
  }

  const nextMilestone = await getNextMilestone(bot.github)
  if (nextMilestone) {
    await bot.github.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      milestone: nextMilestone.number,
    })
  }
}
