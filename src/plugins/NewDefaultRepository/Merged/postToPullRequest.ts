import { Context } from "probot";

import {
  messageCommon,
  messageLinks,
  messageIntegrations,
  messagePlugins,
} from "./messages";

export async function postToPullRequest(context: Context, category: string) {
  let body: string = messageCommon;
  if (category === "integration") {
    body += messageIntegrations;
  }

  if (category === "plugin") {
    body += messagePlugins;
  }

  body += messageLinks;

  await context.github.issues.createComment(context.issue({ body }));
}
