import { App } from 'octokit'
import { RepositoryName } from '../const'
import { PullPayload } from '../types'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'

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

  await app.octokit.rest.issues.update({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    milestone: 'next',
  })

  await app.octokit.rest.issues.lock({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
  })
}
