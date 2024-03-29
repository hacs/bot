import { App } from 'octokit'
import { RepositoryName } from '../const'
import { ReleasePayload } from '../types'

import { getNextMilestone } from '../utils/nextMilestone'

export default async (app: App, payload: ReleasePayload): Promise<void> => {
  if (
    payload.action !== 'published' ||
    payload.repository.name !== RepositoryName.INTEGRATION
  ) {
    return
  }

  const nextMilestone = await getNextMilestone(app)
  if (nextMilestone) {
    await app.octokit.rest.issues.updateMilestone({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      milestone_number: nextMilestone.number,
      title: payload.release.tag_name,
      description: `Issues and PR's attached to this milestone where a part of the ${payload.release.tag_name} version of HACS.`,
      state: 'closed',
    })
  }

  await app.octokit.rest.issues.createMilestone({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    title: 'next',
    description:
      'This milestone contains what the next version of HACS will have.',
  })
}
