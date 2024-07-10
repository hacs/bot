import { Toucan } from 'toucan-js'
import { EmitterWebhookEvent } from '@octokit/webhooks'
import { App } from 'octokit'

import integrationRepoIssueClosedPlugin from './plugins/integrationRepoIssueClosed'
import integrationRepoPullClosedPlugin from './plugins/integrationRepoPullClosed'
import newDefaultMergedPlugin from './plugins/newDefaultMerged'
import newDefaultOpenedPlugin from './plugins/newDefaultOpened'
import integrationReleaseCreatedPlugin from './plugins/integrationReleaseCreated'

import { issuePull, release } from './utils/eventPayloads'
import { GitHubBot } from './github.bot'

const getApp = async () => {
  const app = new App({
    appId: Number(APP_ID),
    privateKey: PRIVATE_KEY,
    webhooks: {
      secret: WEBHOOK_SECRET,
    },
  })
  app.octokit = await app.getInstallationOctokit(Number(INSTALLATION_ID))
  return app
}

const sentryClient = (request: Request) => {
  const client = new Toucan({
    dsn: SENTRY_DSN,
    requestDataOptions: {
      allowedHeaders: ['user-agent', 'cf-ray'],
    },
    request,
    initialScope: {
      tags: {},
    },
  })

  return client
}

export async function handleRequest(request: Request): Promise<Response> {
  const app = await getApp()
  const sentry = sentryClient(request)
  app.webhooks.on('issues', handleWebhookEvent)
  app.webhooks.on('pull_request', handleWebhookEvent)
  app.webhooks.on('issue_comment', handleWebhookEvent)
  app.webhooks.on('release', handleWebhookEvent)

  const bot = new GitHubBot({
    request,
    env: {
      APP_ID,
      CF_VERSION_METADATA,
      DISCORD_WEBHOOK,
      INSTALLATION_ID,
      ORGANIZATION,
      PRIVATE_KEY,
      SENTRY_DSN,
      WEBHOOK_SECRET,
    },
  })

  const payload = await request.json<EmitterWebhookEvent['payload']>()
  await bot.processRequest(payload)

  try {
    await app.webhooks.receive({
      id: request.headers.get('x-github-delivery') || '',
      // @ts-expect-error may be blank
      name: request.headers.get('x-github-event') || '',
      payload,
    })
  } catch (err) {
    console.error(err)
    sentry.captureException(err)
    throw new Error(String(err))
  }
  return new Response()
}

async function handleWebhookEvent(event: EmitterWebhookEvent): Promise<void> {
  const app = await getApp()
  const payload = issuePull(event) || release(event)
  if (!payload) return

  if ('pull_request' in payload) {
    await Promise.all([
      newDefaultOpenedPlugin(app, payload),
      newDefaultMergedPlugin(app, payload),
      integrationRepoPullClosedPlugin(app, payload),
    ])
  } else if ('issue' in payload && payload.action === 'closed') {
    await Promise.all([integrationRepoIssueClosedPlugin(app, payload)])
  } else if ('release' in payload) {
    await Promise.all([integrationReleaseCreatedPlugin(app, payload)])
  }
}
