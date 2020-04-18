import { Context } from "probot";

import { messageCommon, messageLinks, messageIntegrations } from "./messages";

export async function postToPullRequest(context: Context, category: string) {
  let body: string = messageCommon;
  if (category === "integration") {
    body += messageIntegrations;
  }

  body += messageLinks;

  await context.github.issues.createComment(context.issue({ body }));
}
