import { PullPayload } from '../types'
import { GitHubBot } from '../github.bot'

export default async (bot: GitHubBot, payload: PullPayload): Promise<void> => {
  try {
    await bot.slackMessage({
      blocks: [
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `${payload.action} @ <${payload.pull_request.html_url}|${payload.repository.name}#${payload.pull_request.number}: ${payload.pull_request.title}>`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `:bust_in_silhouette: ${payload.sender.login} - ${(
                payload.pull_request.labels || [{ name: 'no label' }]
              )
                .map((label) => `${label.name}`)
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
              text: `${payload.pull_request.body?.substring(0, 300)}...`,
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
