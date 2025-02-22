import { handleRequest } from './handler'

declare global {
  const APP_ID: string
  const SLACK_WEBHOOK: string
  const DISCORD_WEBHOOK: string
  const DISCORD_WEBHOOK_BOT: string
  const INSTALLATION_ID: string
  const ORGANIZATION: string
  const PRIVATE_KEY: string
  const WEBHOOK_SECRET: string
  const SENTRY_DSN: string
  const CF_VERSION_METADATA: { id: string; tag: string; timestamp: string }
}

addEventListener('fetch', (event) => {
  if (
    event.request.method === 'POST' &&
    event.request.cf?.asOrganization === ORGANIZATION
  ) {
    event.respondWith(handleRequest(event.request))
  } else {
    event.respondWith(new Response(null, { status: 403 }))
  }
})
