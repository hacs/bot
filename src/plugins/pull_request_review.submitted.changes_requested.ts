import { PullReviewPayload } from '../types'
import { GitHubBot } from '../github.bot'
import { convertPullRequestToDraft } from '../utils/convertToDraft'

/** * When a pull request review is submitted with "changes_requested" by a member,
 * convert the pull request to a draft.
 */
export default async (
  bot: GitHubBot,
  payload: PullReviewPayload,
): Promise<void> => {
  if (
    !('review' in payload) ||
    payload.review.state !== 'changes_requested' ||
    payload.review.author_association !== 'MEMBER'
  ) {
    return
  }

  await convertPullRequestToDraft(bot.github, payload.pull_request.node_id)
}
