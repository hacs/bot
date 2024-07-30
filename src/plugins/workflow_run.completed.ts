import { WorkflowRunPayload } from '../types'

import { GitHubBot } from '../github.bot'
import * as Sentry from '@sentry/browser'
import { createTransport } from '@sentry/core'
import type {
  Transport,
  TransportMakeRequestResponse,
  TransportRequest,
} from '@sentry/types'
import { rejectedSyncPromise } from '@sentry/utils'

export default async (
  bot: GitHubBot,
  payload: WorkflowRunPayload,
): Promise<void> => {
  if (payload.repository.owner.login !== 'hacs') {
    return
  }

  Sentry.init({
    dsn: bot.env.SENTRY_DSN,
    sampleRate: 1,
    integrations: [Sentry.captureConsoleIntegration()],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: (options: any): Transport => {
      function makeRequest({
        body,
      }: TransportRequest): PromiseLike<TransportMakeRequestResponse> {
        try {
          const fetchFn = options.fetcher ?? fetch
          const request = fetchFn(options.url, {
            method: 'POST',
            headers: options.headers,
            body,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }).then((response: any) => {
            return {
              statusCode: response.status,
              headers: {
                'retry-after': response.headers.get('Retry-After'),
                'x-sentry-rate-limits': response.headers.get(
                  'X-Sentry-Rate-Limits',
                ),
              },
            }
          })

          /**
           * Call waitUntil to extend Workers Event lifetime
           */
          if (options.context) {
            options.context.waitUntil(request)
          }

          return request
        } catch (e) {
          return rejectedSyncPromise(e)
        }
      }

      return createTransport(options, makeRequest)
    },
  })

  Sentry.metrics.increment('workflow_run.completed', 1, {
    tags: {
      conclusion: payload.workflow_run.conclusion,
      name: payload.workflow_run.name,
      repository: payload.repository.full_name,
      event: payload.workflow_run.event,
    },
  })
}
