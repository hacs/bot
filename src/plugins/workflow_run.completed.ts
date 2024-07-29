import { WorkflowRunPayload } from '../types'

import { GitHubBot } from '../github.bot'
import * as Sentry from '@sentry/browser'

export default async (
  bot: GitHubBot,
  payload: WorkflowRunPayload,
): Promise<void> => {
  if (payload.repository.owner.login !== 'hacs') {
    return
  }

  Sentry.metrics.increment('workflow_run.completed', 1, {
    client: bot.sentry.getClient() as Sentry.BrowserClient,
    tags: {
      conclusion: payload.workflow_run.conclusion,
      name: payload.workflow_run.name,
      repository: payload.repository.full_name,
      event: payload.workflow_run.event,
    },
  })
}
