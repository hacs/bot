import { WorkflowRunPayload } from '../types'

import { GitHubBot } from '../github.bot'

export default async (
  bot: GitHubBot,
  payload: WorkflowRunPayload,
): Promise<void> => {
  if (payload.repository.owner.login !== 'hacs') {
    return
  }

  bot.sentry.metrics.increment('workflow_run.completed', 1, {
    tags: {
      conclusion: payload.workflow_run.conclusion,
      name: payload.workflow_run.name,
      repository: payload.repository.full_name,
      event: payload.workflow_run.event,
    },
  })
}
