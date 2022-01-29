import { EmitterWebhookEvent } from '@octokit/webhooks'
import { App } from 'octokit'

//import DebugPlugin from './plugins/debug'
import newDefaultOpenedPlugin from './plugins/newDefaultOpened'
import newDefaultMergedPlugin from './plugins/newDefaultMerged'
import clearTempLabelsPlugin from './plugins/clearTempLabels'
import issueCommandsPlugin from './plugins/issueCommands'
import greeterPlugin from './plugins/greeter'

import { issuePull } from './utils/issuePull'

const app = new App({
  appId: Number(APP_ID),
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET,
  },
})
app.webhooks.on('issues', handleWebhookEvent)
app.webhooks.on('pull_request', handleWebhookEvent)

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 403 })

  app.octokit = await app.getInstallationOctokit(Number(INSTALLATION_ID))

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
  const payload = issuePull(event)
  if (!payload) return

  //await DebugPlugin(app, payload)

  if ('pull_request' in payload) {
    await Promise.all([
      newDefaultOpenedPlugin(app, payload),
      newDefaultMergedPlugin(app, payload),
      clearTempLabelsPlugin(app, payload),
    ])
  } else if ('issue' in payload && payload.action === 'opened') {
    await greeterPlugin(app, payload)
  } else if ('issue_comment' in payload) {
    await Promise.all([issueCommandsPlugin(app, payload)])
  }
}
