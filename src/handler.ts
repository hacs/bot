import { EmitterWebhookEvent } from '@octokit/webhooks'
import * as Sentry from '@sentry/cloudflare'
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

  Sentry.setContext(
    'Headers',
    ['cf-ray', 'user-agent', 'x-github-event', 'x-hub-signature-256'].reduce(
      (acc, key) => ({ ...acc, [key]: request.headers.get(key) }),
      {},
    ),
  )

  let payload: EmitterWebhookEvent['payload']
  try {
    payload = JSON.parse(rawBody)
  } catch (err) {
    throw new Error(
      `Failed to parse webhook payload: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const githubEventName = request.headers.get('x-github-event')

  if (!githubEventName) {
    throw new Error('Missing x-github-event header')
  }

  const bot = new GitHubBot({ env })
  await bot.processRequest(payload, githubEventName)

  return new Response(null, {
    headers: { 'x-worker-metadata-id': env.CF_VERSION_METADATA.id },
  })
}
