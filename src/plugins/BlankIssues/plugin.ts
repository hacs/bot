import { Application, Context } from "probot";
import { senderIsBot, senderIsAdmin } from "../../util/filter";

import { TEMPLATES } from "./templates";

export const NAME = "BlankIssues";

export const initBlankIssues = (app: Application) => {
  app.on("issues.opened", async (context) => {
    await runKnownIssues(context);
  });
};

export async function runKnownIssues(context: Context) {
  if (senderIsBot(context)) return;
  if (senderIsAdmin(context)) return;
  const issueOrPr = context.payload.issue || context.payload.pull_request;
  let found: number;

  if (TEMPLATES.includes(issueOrPr.body)) {
    await Promise.all([
      context.github.issues.removeLabel(context.issue({ name: "flag" })),
      context.github.issues.addLabels(context.issue({ labels: ["invalid"] })),
      context.github.issues.removeAssignees(context.issue()),
      context.github.issues.update(context.issue({state: "closed"}))
    ]);
  }
}
