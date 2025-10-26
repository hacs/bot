import { WorkflowRunPayload } from '../types'

import { GitHubBot } from '../github.bot'

const ignoreWorksflows = new Set(["Lock closed issues and PR's"])

export default async (
  bot: GitHubBot,
  payload: WorkflowRunPayload,
): Promise<void> => {
  if (
    payload.repository.owner.login !== 'hacs' ||
    payload.workflow_run.event !== 'schedule'
  ) {
    return
  }

  if (
    payload.workflow_run.conclusion === 'failure' &&
    !ignoreWorksflows.has(payload.workflow_run.name)
  ) {
    await bot.discordMessage({
      username: 'Github webhook',
      content: `<@&713492053484634172> GitHub action '${payload.workflow_run.name}' with ID [${payload.workflow_run.id}](<https://github.com/${payload.repository.full_name}/actions/runs/${payload.workflow_run.id}>) failed!`,
    })

    await bot.slackMessage({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `GitHub action ${payload.workflow_run.name} failed!`,
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
              text: `<@U078TE219SA> <https://github.com/${payload.repository.full_name}/actions/runs/${payload.workflow_run.id}|${payload.workflow_run.name}#${payload.workflow_run.id}>`,
            },
          ],
        },
      ],
    })
  }
}
