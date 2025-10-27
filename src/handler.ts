import { EmitterWebhookEvent } from '@octokit/webhooks'
import { GitHubBot } from './github.bot'
import type { Env } from './index'

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const bot = new GitHubBot({ request, env })

  const payload = await request.json<EmitterWebhookEvent['payload']>()
  await bot.processRequest(payload)

  return new Response(null, {
    headers: { 'x-worker-metadata-id': env.CF_VERSION_METADATA.id },
  })
}
