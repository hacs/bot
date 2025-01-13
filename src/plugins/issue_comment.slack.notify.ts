import { IssueCommentPayload } from '../types'
import { GitHubBot } from '../github.bot'

export default async (
  bot: GitHubBot,
  payload: IssueCommentPayload,
): Promise<void> => {
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
        {
          type: 'actions',
          elements: (payload.issue.labels || [{ name: 'no label' }]).map(
            (label) => ({
              type: 'button',
              text: {
                type: 'plain_text',
                text: label.name,
              },
            }),
          ),
        },
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
