import { App } from 'octokit'
import { RepositoryName } from '../const'
import { CheckSuitePayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'

export default async (app: App, payload: CheckSuitePayload): Promise<void> => {
  if (
    senderIsBot(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT ||
    payload.action !== 'completed' ||
    !payload.check_suite.conclusion ||
    !['failure', 'cancelled'].includes(payload.check_suite.conclusion) ||
    !payload.check_suite.pull_requests.length
  ) {
    return
  }

  const { data: pull } = await app.octokit.rest.pulls.get({
    ...extractOwnerRepo(payload),
    pull_number: payload.check_suite.pull_requests[0].number,
  })

  if (pull.review_comments) {
    return
  }

  await app.octokit.rest.issues.update({
    ...extractOwnerRepo(payload),
    issue_number: pull.number,
    assignees: [payload.sender.login],
  })

  await app.octokit.rest.pulls.createReview({
    ...extractOwnerRepo(payload),
    pull_number: pull.number,
    event: 'REQUEST_CHANGES',
    body: 'CI Does not pass. https://hacs.xyz/docs/publish/include#before-submitting',
  })
}
