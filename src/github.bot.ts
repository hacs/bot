import { EmitterWebhookEvent } from '@octokit/webhooks'
import { App } from 'octokit'
import * as Sentry from '@sentry/browser'
import { MetricData } from '@sentry/types/types/metrics'
import { plugins } from './plugins'
import { IssuePullPayload } from './types'
import { issuePull, release, workflowRun } from './utils/eventPayloads'
import { verifyWebhookSignature } from './utils/verify'
import { makeFetchTransport } from 'toucan-js/dist/transports'

Sentry.init({
  dsn: SENTRY_DSN,
  sampleRate: 1.0,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  profilesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  transport: (options) => makeFetchTransport({ ...options }),
  enabled: true,
  integrations: [
    Sentry.dedupeIntegration(),
    Sentry.extraErrorDataIntegration(),
    Sentry.sessionTimingIntegration(),
    Sentry.debugIntegration(),
    Sentry.replayIntegration(),
    Sentry.sessionTimingIntegration(),
  ],
  initialScope: {
    extra: {
      request: {},
    },
  },
})

type Env = {
  APP_ID: string
  CF_VERSION_METADATA: { id: string; tag: string; timestamp: string }
  INSTALLATION_ID: string
  PRIVATE_KEY: string
  SENTRY_DSN: string
  DISCORD_WEBHOOK: string
  WEBHOOK_SECRET: string
  ORGANIZATION: string
}

export class GitHubBot {
  private request: Request
  private env: Env
  public github: App

  public sentry = {
    metrics: {
      increment: (name: string, value?: number, data?: MetricData): void => {
        Sentry.metrics.increment(
          name,
          value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data as any,
        )
      },
    },
    captureException: (exception: unknown, hint?: Sentry.EventHint): string => {
      const id = Sentry.captureException(exception, hint)
      console.log(`Capturing exception (${id}): ${exception}`)
      return id
    },
    captureMessage: (message: string, level?: Sentry.SeverityLevel): string => {
      const id = Sentry.captureMessage(message, level)
      console.log(`Capturing message (${id}): ${message}`)
      return id
    },
  }

  constructor(options: { request: Request; env: Env }) {
    this.request = options.request
    this.env = options.env

    if (Sentry.getClient()?.getOptions()?.dsn) {
      Sentry.getClient()!.getOptions().dsn = this.env.SENTRY_DSN
    }

    this.github = new App({
      appId: Number(this.env.APP_ID),
      privateKey: this.env.PRIVATE_KEY,
      webhooks: {
        secret: this.env.WEBHOOK_SECRET,
      },
    })
  }

  async internalProcessRequest(
    rawPayload: Record<string, unknown>,
  ): Promise<void> {
    await verifyWebhookSignature(
      JSON.stringify(rawPayload),
      this.env.WEBHOOK_SECRET,
      this.request.headers.get('x-hub-signature-256') ?? '',
    )

    // Init the octoclient so handler can use it
    this.github.octokit = await this.github.getInstallationOctokit(
      Number(this.env.INSTALLATION_ID),
    )

    const rawBody = { payload: rawPayload } as EmitterWebhookEvent

    const eventName = this.request.headers.get('x-github-event') as string
    const payload =
      issuePull(rawBody) || release(rawBody) || workflowRun(rawBody)
    if (!payload) {
      return
    }

    for (const handler of [
      ...plugins.base,
      ...(plugins[`${eventName}.${payload.action}`] || []),
    ]) {
      console.log(
        `Processing "${eventName}.${payload.action}" with ${handler.name}`,
      )
      await handler(this, payload as IssuePullPayload)
    }
  }

  public async processRequest(
    rawPayload: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.internalProcessRequest(rawPayload)
    } catch (err) {
      console.error(err)
      this.sentry.captureException(err)
      throw err
    }

    await Sentry.flush(6000)
    await Sentry.close()
  }
}
