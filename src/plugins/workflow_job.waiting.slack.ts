import { WorkflowJobPayload } from '../types'
import { GitHubBot } from '../github.bot'

export default async (
  bot: GitHubBot,
  payload: WorkflowJobPayload,
): Promise<void> => {
  if (payload.workflow_job.status !== 'waiting') {
    return
  }

  try {
    await bot.slackMessage({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `GitHub action ${payload.workflow_job.workflow_name} is waiting!`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<@U078TE219SA> <https://github.com/${payload.repository.full_name}/actions/runs/${payload.workflow_job.run_id}|${payload.workflow_job.name}#${payload.workflow_job.run_id}>`,
            },
          ],
        },
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
