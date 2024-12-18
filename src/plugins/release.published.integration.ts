import { ReleasePayload } from '../types'

import { GitHubBot } from '../github.bot'
import { RepositoryName } from '../const'
import { getNextMilestone } from '../utils/nextMilestone'

export default async (
  bot: GitHubBot,
  payload: ReleasePayload,
): Promise<void> => {
  if (
    payload.action !== 'published' ||
    payload.repository.name !== RepositoryName.INTEGRATION
  ) {
    return
  }

  const nextMilestone = await getNextMilestone(bot.github)
  if (nextMilestone) {
    await bot.github.octokit.rest.issues.updateMilestone({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      milestone_number: nextMilestone.number,
      title: payload.release.tag_name,
      description: `Issues and PR's attached to this milestone where a part of the ${payload.release.tag_name} version of HACS.`,
      state: 'closed',
    })
  }

  await bot.github.octokit.rest.issues.createMilestone({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    title: 'next',
    description:
      'This milestone contains what the next version of HACS will have.',
  })
}
