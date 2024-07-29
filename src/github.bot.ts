import { EmitterWebhookEvent } from '@octokit/webhooks'
import { App } from 'octokit'
import {
  Toucan,
  dedupeIntegration,
  extraErrorDataIntegration,
  requestDataIntegration,
  sessionTimingIntegration,
} from 'toucan-js'
import { plugins } from './plugins'
import { IssuePullPayload } from './types'
import { issuePull, release, workflowRun } from './utils/eventPayloads'
import { verifyWebhookSignature } from './utils/verify'

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

  public sentry: Toucan

  constructor(options: { request: Request; env: Env }) {
    this.request = options.request
    this.env = options.env

    this.sentry = new Toucan({
      dsn: this.env.SENTRY_DSN,
      requestDataOptions: {
        allowedHeaders: ['user-agent', 'cf-ray'],
      },
      integrations: [
        dedupeIntegration,
        extraErrorDataIntegration,
        requestDataIntegration,
        sessionTimingIntegration,
      ],
      request: this.request,
      initialScope: {
        tags: {},
      },
    })

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
  }
}
