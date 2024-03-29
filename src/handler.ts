import { EmitterWebhookEvent } from '@octokit/webhooks'
import { App } from 'octokit'

//import DebugPlugin from './plugins/debug'
import greeterPlugin from './plugins/greeter'
import integrationRepoIssueClosedPlugin from './plugins/integrationRepoIssueClosed'
import integrationRepoPullClosedPlugin from './plugins/integrationRepoPullClosed'
import newDefaultMergedPlugin from './plugins/newDefaultMerged'
import newDefaultOpenedPlugin from './plugins/newDefaultOpened'
import integrationReleaseCreatedPlugin from './plugins/integrationReleaseCreated'

import { issuePull, release } from './utils/eventPayloads'

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

export async function handleRequest(request: Request): Promise<Response> {
  const app = await getApp()
  app.webhooks.on('issues', handleWebhookEvent)
  app.webhooks.on('pull_request', handleWebhookEvent)
  app.webhooks.on('issue_comment', handleWebhookEvent)
  app.webhooks.on('release', handleWebhookEvent)

  try {
    await app.webhooks.receive({
      id: request.headers.get('x-github-delivery') || '',
      // @ts-expect-error may be blank
      name: request.headers.get('x-github-event') || '',
      payload: await request.json<EmitterWebhookEvent['payload']>(),
    })
  } catch (err) {
    console.error(err)
    throw new Error(String(err))
  }
  return new Response()
}

async function handleWebhookEvent(event: EmitterWebhookEvent): Promise<void> {
  const app = await getApp()
  const payload = issuePull(event) || release(event)
  if (!payload) return

  //await DebugPlugin(app, payload)

  if ('pull_request' in payload) {
    await Promise.all([
      newDefaultOpenedPlugin(app, payload),
      newDefaultMergedPlugin(app, payload),
      integrationRepoPullClosedPlugin(app, payload),
    ])
  } else if ('issue' in payload && payload.action === 'opened') {
    await Promise.all([greeterPlugin(app, payload)])
  } else if ('issue' in payload && payload.action === 'closed') {
    await Promise.all([integrationRepoIssueClosedPlugin(app, payload)])
  } else if ('release' in payload) {
    await Promise.all([integrationReleaseCreatedPlugin(app, payload)])
  }
}
