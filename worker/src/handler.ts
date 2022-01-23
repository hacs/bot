import { EmitterWebhookEvent } from "@octokit/webhooks";
import { App } from "octokit";

import { DebugPlugin } from "./plugins/debug"
import {issuePull} from "./utils/issuePull"

const app = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET,
    onAny: handleWebhookEvent,
  },
});
app.webhooks.on("issues", handleWebhookEvent)
app.webhooks.on("pull_request", handleWebhookEvent)

export async function handleRequest(request: Request): Promise<Response> {
  await app.webhooks.receive({
    id: request.headers.get("x-github-delivery") || "",
    // @ts-expect-error may be blank
    name: request.headers.get("x-github-event") || "",
    payload: await request.json<EmitterWebhookEvent["payload"]>(),
  });

  return new Response()
}

async function handleWebhookEvent(event: EmitterWebhookEvent): Promise<void> {
  const payload = issuePull(event)
  if (!payload) {
    return
  }

  await Promise.allSettled(
    [
      DebugPlugin(app, payload),
    ]
  )

}