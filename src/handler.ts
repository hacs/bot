import { EmitterWebhookEvent } from '@octokit/webhooks'
import { GitHubBot } from './github.bot'

export async function handleRequest(request: Request): Promise<Response> {
  const bot = new GitHubBot({
    request,
    env: {
      APP_ID,
      CF_VERSION_METADATA,
      SLACK_WEBHOOK,
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

  return new Response(null, {
    headers: { 'x-worker-metadata-id': CF_VERSION_METADATA.id },
  })
}
