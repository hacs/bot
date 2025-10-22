import { IssuePullPayload, PayloadIsPull } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { RepositoryName } from '../const'

const label = 'New default repository'
const postedComment = `
Thank you for submitting your repository to HACS (Home Assistant Community Store).

**Your submission is in the review queue:**
Your repository is waiting to be reviewed and included in HACS.

You can [view the current queue here](https://github.com/hacs/default/pulls?q=is%3Apr+is%3Aopen+draft%3Afalse+sort%3Acreated-asc). Pull requests are processed in the order they were created, oldest first.

**What to avoid during review:**
To help reviewers work efficiently, don't do the following:

- **Comment on the pull request** - The reviewer will contact you when they have feedback or questions.
- **Open a new pull request** - This won't speed up the process and creates duplicate work.
- **Ask followers to comment on the pull request** - This won't speed up the process and may delay your review.
- **Merge in the main or master branch** - Only do this if a maintainer asks you to resolve a merge conflict.

**If you need to make changes:**
You can continue updating your repository while waiting for review. Changes to your repository will be reflected when the reviewer examines it. Only comment on the pull request if you need to withdraw your submission or have critical information for reviewers.

**About draft pull requests:**
Draft pull requests aren't included in the review queue. Your pull request may be marked as draft by a reviewer if issues need to be addressed. Once you've resolved all issues, mark it as ready for review to re-enter the queue.

**What happens next:**
Once a reviewer examines your submission, they'll either:

- Approve and merge your pull request if everything meets the requirements
- Request changes or ask questions if adjustments are needed
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
