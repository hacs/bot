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

import type { WebhookMessageCreateOptions } from 'discord.js'
import type { KnownBlock } from '@slack/types'

type Env = {
  APP_ID: string
  CF_VERSION_METADATA: { id: string; tag: string; timestamp: string }
  INSTALLATION_ID: string
  PRIVATE_KEY: string
  SENTRY_DSN: string
  SLACK_WEBHOOK: string
  DISCORD_WEBHOOK: string // "new-repositories" channel
  DISCORD_WEBHOOK_BOT: string // "bot" channel
  WEBHOOK_SECRET: string
  ORGANIZATION: string
  DEBUG?: string
}

export class GitHubBot {
  public env: Env
  public github: App

  constructor(options: { env: Env }) {
    this.env = options.env

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
    githubEventName: string,
  ): Promise<void> {
    Sentry.setExtras({ ...rawPayload })

    // Init the octoclient so handler can use it
    this.github.octokit = await this.github.getInstallationOctokit(
      Number(this.env.INSTALLATION_ID),
    )

    const webhookEvent = { payload: rawPayload } as EmitterWebhookEvent

    const payload =
      issuePull(webhookEvent) ||
      release(webhookEvent) ||
      workflowRun(webhookEvent) ||
      workflowJob(webhookEvent)

    if (!payload) {
      return
    }

    const activeHandlers = [
      ...plugins.base,
      ...(plugins[`${githubEventName}.${payload.action}`] || []),
    ]

    Sentry.setExtra(
      'activeHandlers',
      activeHandlers.map((h) => h.name),
    )

    for (const handler of activeHandlers) {
      console.log(
        `Processing "${githubEventName}.${payload.action}" with ${handler.name}`,
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
    githubEventName: string,
  ): Promise<void> {
    try {
      await this.internalProcessRequest(rawPayload, githubEventName)
    } catch (err) {
      console.error(err)
      Sentry.captureException(err)
      throw err
    }
  }

  public async discordMessage(
    options: WebhookMessageCreateOptions & { webhookUrl?: string },
  ): Promise<void> {
    await fetch(
      options.webhookUrl || this.env.DISCORD_WEBHOOK_BOT || 'dev://null',
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
    webhookUrl,
  }: {
    blocks: KnownBlock[]
    webhookUrl?: string
  }): Promise<void> {
    await fetch(webhookUrl || this.env.SLACK_WEBHOOK || 'dev://null', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blocks }),
    })
  }
}
