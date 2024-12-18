import { EmitterWebhookEvent } from '@octokit/webhooks'

import * as Sentry from '@sentry/browser'

import { GitHubBot } from './github.bot'

export async function handleRequest(request: Request): Promise<Response> {
  const bot = new GitHubBot({
    request,
    env: {
      APP_ID,
      CF_VERSION_METADATA,
      DISCORD_WEBHOOK,
      DISCORD_WEBHOOK_BOT,
      INSTALLATION_ID,
      ORGANIZATION,
      PRIVATE_KEY,
      SENTRY_DSN,
      WEBHOOK_SECRET,
    },
  })

  const payload = await request.json<EmitterWebhookEvent['payload']>()
  await bot.processRequest(payload)

  await Sentry.close()
  return new Response(null, {
    headers: { 'x-worker-tag': CF_VERSION_METADATA.tag },
  })
}
