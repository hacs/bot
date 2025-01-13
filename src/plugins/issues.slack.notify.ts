import { IssuePayload } from '../types'
import { GitHubBot } from '../github.bot'

export default async (bot: GitHubBot, payload: IssuePayload): Promise<void> => {
  try {
    await bot.slackMessage({
      blocks: [
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `${payload.action} @ <${payload.issue.html_url}|${payload.repository.name}#${payload.issue.number}: ${payload.issue.title}>`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `:bust_in_silhouette: ${payload.sender.login} - ${(
                payload.issue.labels || [{ name: 'no label' }]
              )
                .map((label) => `\`${label.name}\``)
                .join(' ')}`,
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
              text: `${payload.issue.body?.substring(0, 300)}...`,
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
