import { EmitterWebhookEvent } from "@octokit/webhooks";
import { App } from "octokit";

import { DebugPlugin } from "./plugins/debug"

const app = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET,
    onAny: handleWebhookEvent,
  },
});
app.webhooks.onAny(handleWebhookEvent)

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
  await Promise.allSettled(
    [
      DebugPlugin(app, event),
    ]
  )

}