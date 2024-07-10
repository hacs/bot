import { IssuePullPayload, PayloadIsIssue } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !PayloadIsIssue(payload) ||
    payload.action !== 'opened'
  ) {
    return
  }

  if (extractOwnerRepo(payload).repo !== 'integration') {
    await bot.github.octokit.rest.issues.createComment({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      body: `Issues should be opened in [hacs/integration](https://github.com/hacs/integration/issues) see [docs](https://hacs.xyz/docs/issues) for more info.`,
    })
    await bot.github.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      state: 'closed',
    })
    await bot.github.octokit.rest.issues.lock({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
    })
    return
  }

  await bot.github.octokit.rest.issues.createComment({
    ...extractOwnerRepo(payload),
    issue_number: payload.issue.number,
    body: `Make sure you have read the [issue guidelines](https://hacs.xyz/docs/issues) and that you filled out the **entire** template.\n

If you have an issue identical to this, do **not** add comments like "same here", "i have this too", instead add a :+1: reaction to the issue description. Thanks! :+1:`,
  })
}
