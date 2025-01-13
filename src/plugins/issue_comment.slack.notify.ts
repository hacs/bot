import { IssueCommentPayload } from '../types'
import { GitHubBot } from '../github.bot'
import { senderIsBot } from '../utils/filter'

export default async (
  bot: GitHubBot,
  payload: IssueCommentPayload,
): Promise<void> => {
  if (senderIsBot(payload)) {
    return
  }

  try {
    await bot.slackMessage({
      blocks: [
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `<${payload.issue.html_url}|${payload.repository.name}#${payload.issue.number}: ${payload.issue.title}>`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `:speaking_head_in_silhouette: ${payload.sender.login}`,
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `${payload.comment.body?.substring(0, 300)}...`,
            },
          ],
        },
        {
          type: 'divider',
        },
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
