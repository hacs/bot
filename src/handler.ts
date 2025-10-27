import { EmitterWebhookEvent } from '@octokit/webhooks'
import { GitHubBot } from './github.bot'
import { verifyWebhookSignature } from './utils/verify'
import type { Env } from './index'

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const rawBody = await request.text()

  await verifyWebhookSignature(
    rawBody,
    env.WEBHOOK_SECRET,
    request.headers.get('x-hub-signature-256') ?? '',
  )

  const payload = JSON.parse(rawBody) as EmitterWebhookEvent['payload']

  const bot = new GitHubBot({ request, env })
  await bot.processRequest(payload)

  return new Response(null, {
    headers: { 'x-worker-metadata-id': env.CF_VERSION_METADATA.id },
  })
}
