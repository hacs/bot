import { handleRequest } from './handler'

declare global {
  const APP_ID: string
  const DISCORD_WEBHOOK: string
  const INSTALLATION_ID: string
  const ORGANIZATION: string
  const PRIVATE_KEY: string
  const WEBHOOK_SECRET: string
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
