import { WorkflowRunPayload } from '../types'

import * as Sentry from '@sentry/browser'
import { GitHubBot } from '../github.bot'

const ignoreWorksflows = new Set(["Lock closed issues and PR's'"])

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

  Sentry.metrics.increment('workflow_run.completed', 1, {
    tags: {
      conclusion: payload.workflow_run.conclusion,
      name: payload.workflow_run.name,
      repository: payload.repository.full_name,
      event: payload.workflow_run.event,
    },
  })

  if (
    payload.workflow_run.conclusion === 'failure' &&
    !ignoreWorksflows.has(payload.workflow_run.name)
  ) {
    await bot.discordMessage({
      username: 'Github webhook',
      content: `<@&713492053484634172> GitHub action '${payload.workflow_run.name}' with ID [${payload.workflow_run.id}](<https://github.com/${payload.repository.full_name}/actions/runs/${payload.workflow_run.id}>) failed!`,
    })
  }
}
