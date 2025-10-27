import * as Sentry from '@sentry/cloudflare'
import { handleRequest } from './handler'

export interface Env {
  APP_ID: string
  SLACK_WEBHOOK: string
  DISCORD_WEBHOOK: string
  DISCORD_WEBHOOK_BOT: string
  INSTALLATION_ID: string
  ORGANIZATION: string
  PRIVATE_KEY: string
  WEBHOOK_SECRET: string
  SENTRY_DSN: string
  CF_VERSION_METADATA: { id: string; tag: string; timestamp: string }
}

export default Sentry.withSentry(
  (env) => ({
    dsn: env.SENTRY_DSN,
    release: env.CF_VERSION_METADATA.tag || env.CF_VERSION_METADATA.id,
    tracesSampleRate: 1.0,
    sampleRate: 1.0,
    integrations: [
      Sentry.captureConsoleIntegration({ levels: ['warn', 'error'] }),
      Sentry.dedupeIntegration(),
      Sentry.eventFiltersIntegration(),
      Sentry.extraErrorDataIntegration(),
      Sentry.fetchIntegration(),
      Sentry.functionToStringIntegration(),
      Sentry.linkedErrorsIntegration(),
      Sentry.moduleMetadataIntegration(),
      Sentry.requestDataIntegration(),
      Sentry.rewriteFramesIntegration(),
    ],
  }),
  {
    async fetch(
      request: Request<unknown, IncomingRequestCfProperties<unknown>>,
      env: Env,
      _: ExecutionContext<unknown>,
    ): Promise<Response> {
      if (
        request.method === 'POST' &&
        request.cf?.asOrganization === env.ORGANIZATION
      ) {
        return handleRequest(request, env)
      } else {
        return new Response(null, { status: 403 })
      }
    },
  } satisfies ExportedHandler<Env>,
)
