import { IssuePayload } from '../types'
import { GitHubBot } from '../github.bot'
import { KnownBlock } from '@slack/types'

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
        ...(payload.action !== 'closed'
          ? ([
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `${payload.issue.body?.substring(0, 600)}...`,
                  },
                ],
              },
              {
                type: 'divider',
              },
            ] as KnownBlock[])
          : []),
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
