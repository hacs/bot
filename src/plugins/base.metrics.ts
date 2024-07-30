import { IssuePullPayload, WorkflowRunPayload } from '../types'

import { GitHubBot } from '../github.bot'

import * as Sentry from '@sentry/browser'

const REPOSITORY_METRICS = [
  'stargazers_count',
  'watchers_count',
  'forks_count',
  'open_issues',
]

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload | WorkflowRunPayload,
): Promise<void> => {
  if (payload.repository.owner.login !== 'hacs') {
    return
  }

  for (const key of REPOSITORY_METRICS) {
    Sentry.metrics.gauge(
      `repository.${key}`,
      // @ts-expect-error - TS doesn't like this, but it's fine
      payload.repository[key],
      {
        tags: { repository: payload.repository.full_name },
      },
    )
  }
}
