import { handleRequest } from './handler'

declare global {
  const APP_ID: string;
  const PRIVATE_KEY: string;
  const WEBHOOK_SECRET: string;
  const DISCORD_WEBHOOK: string
  const INSTALLATION_ID: string;
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
