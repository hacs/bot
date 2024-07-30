/*
  Inspired by https://github.com/robertcepa/toucan-js/blob/master/packages/toucan-js/src/transports/fetch.ts
*/

import * as Sentry from '@sentry/browser'

import { createTransport } from '@sentry/core'
import type {
  Transport,
  TransportMakeRequestResponse,
  TransportRequest,
} from '@sentry/types'
import { rejectedSyncPromise } from '@sentry/utils'

export const initSentry = async (options: Sentry.BrowserOptions) => {
  Sentry.init({
    ...options,
    sampleRate: 1,
    tracesSampleRate: 1,
    replaysSessionSampleRate: 1,
    profilesSampleRate: 1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.captureConsoleIntegration({
        levels: ['warn', 'error'],
      }),
      Sentry.debugIntegration(),
      Sentry.dedupeIntegration(),
      Sentry.extraErrorDataIntegration(),
      Sentry.linkedErrorsIntegration(),
      Sentry.rewriteFramesIntegration(),
      Sentry.sessionTimingIntegration(),
    ],
    initialScope: { ...options.initialScope, tags: {} },
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
  Sentry.startSession()
}
