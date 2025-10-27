import { EmitterWebhookEvent } from '@octokit/webhooks'
import * as Sentry from '@sentry/cloudflare'
import { App } from 'octokit'
import { plugins } from './plugins'
import {
  IssuePullPayload,
  PullReviewPayload,
  ReleasePayload,
  WorkflowJobPayload,
  WorkflowRunPayload,
} from './types'
import {
  issuePull,
  release,
  workflowJob,
  workflowRun,
} from './utils/eventPayloads'
import { verifyWebhookSignature } from './utils/verify'

import type { WebhookMessageCreateOptions } from 'discord.js'
import type { KnownBlock } from '@slack/types'

type Env = {
  APP_ID: string
  CF_VERSION_METADATA: { id: string; tag: string; timestamp: string }
  INSTALLATION_ID: string
  PRIVATE_KEY: string
  SENTRY_DSN: string
  SLACK_WEBHOOK: string
  DISCORD_WEBHOOK: string
  DISCORD_WEBHOOK_BOT: string
  WEBHOOK_SECRET: string
  ORGANIZATION: string
  DEBUG?: string
}

export class GitHubBot {
  public request: Request
  public env: Env
  public github: App

  constructor(options: { request: Request; env: Env }) {
    this.request = options.request
    this.env = options.env

    Sentry.setContext(
      'Headers',
      ['cf-ray', 'user-agent', 'x-github-event', 'x-hub-signature-256'].reduce(
        (acc, key) => ({ ...acc, [key]: this.request.headers.get(key) }),
        {},
      ),
    )
    Sentry.setTags(
      Object.keys(this.env.CF_VERSION_METADATA)
        .filter(
          (entry) =>
            this.env.CF_VERSION_METADATA[
              entry as keyof Env['CF_VERSION_METADATA']
            ],
        )
        .reduce(
          (acc, key) => ({
            ...acc,
            [key]:
              this.env.CF_VERSION_METADATA[
                key as keyof Env['CF_VERSION_METADATA']
              ],
          }),
          {},
        ),
    )

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
    Sentry.setExtras({ ...rawPayload })

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
      issuePull(rawBody) ||
      release(rawBody) ||
      workflowRun(rawBody) ||
      workflowJob(rawBody)

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
      await handler(
        this,
        payload as
          | IssuePullPayload
          | PullReviewPayload
          | ReleasePayload
          | WorkflowRunPayload
          | WorkflowJobPayload,
      )
    }
  }

  public async processRequest(
    rawPayload: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.internalProcessRequest(rawPayload)
    } catch (err) {
      console.error(err)
      Sentry.captureException(err)
      throw err
    }
  }

  public async discordMessage(
    options: WebhookMessageCreateOptions & { webookUrl?: string },
  ): Promise<void> {
    await fetch(
      options.webookUrl || this.env.DISCORD_WEBHOOK_BOT || 'dev://null',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      },
    )
  }

  public async slackMessage({
    blocks,
    webookUrl,
  }: {
    blocks: KnownBlock[]
    webookUrl?: string
  }): Promise<void> {
    await fetch(webookUrl || this.env.SLACK_WEBHOOK || 'dev://null', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blocks }),
    })
  }
}
