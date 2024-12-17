import { IssuePullPayload, PayloadIsPull } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { RepositoryName } from '../const'

const label = 'New default repository'
const postedComment = `
Your repository is now waiting to be included in HACS. Please be patient, this will take some time.

[You can see the current queue here](https://github.com/hacs/default/pulls?q=is%3Apr+is%3Aopen+draft%3Afalse+sort%3Acreated-asc) (this is the order that is being used).

There is no need to:
- Comment on the PR, the reviewer will get back to you.
- Open a new PR, this will not speed up the process.
- Ask your folowers to spam the PR, this will not speed up the process.
`

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    !PayloadIsPull(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT ||
    payload.action !== 'labeled' ||
    payload.label?.name !== label
  ) {
    return
  }

  await bot.github.octokit.rest.issues.createComment({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    body: postedComment,
  })
}
