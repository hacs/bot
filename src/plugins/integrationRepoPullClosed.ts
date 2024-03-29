import { App } from 'octokit'
import { RepositoryName } from '../const'
import { PullPayload } from '../types'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { getNextMilestone } from '../utils/nextMilestone'

const SKIP_LABELS = new Set(['pr: dependency-update'])

export default async (app: App, payload: PullPayload): Promise<void> => {
  if (
    senderIsBot(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.INTEGRATION ||
    !['closed'].includes(payload.action)
  ) {
    return
  }

  const { data: pull } = await app.octokit.rest.pulls.get({
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

  const nextMilestone = await getNextMilestone(app)
  if (nextMilestone) {
    await app.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      milestone: nextMilestone.number,
    })
  }
}
