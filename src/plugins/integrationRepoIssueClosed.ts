import { App } from 'octokit'
import { RepositoryName } from '../const'
import { IssuePayload } from '../types'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { getNextMilestone } from '../utils/nextMilestone'

export default async (app: App, payload: IssuePayload): Promise<void> => {
  if (
    senderIsBot(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.INTEGRATION ||
    !['closed'].includes(payload.action)
  ) {
    return
  }

  const { data: pull } = await app.octokit.rest.pulls.get({
    ...extractOwnerRepo(payload),
    pull_number: payload.issue.number,
  })

  if (!pull.labels.filter((label) => label.name === 'bug').length) {
    console.debug('Not a bug')
    return
  }

  const nextMilestone = await getNextMilestone(app)
  if (nextMilestone) {
    await app.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      milestone: nextMilestone.number,
    })
  }
}
