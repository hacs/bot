import { Application, Context } from "probot";
import { senderIsBot, senderIsAdmin } from "../../util/filter";

import { KNOWN_ISSUES } from "./list";

export const NAME = "KnownIssues";

export const initKnownIssues = (app: Application) => {
  app.on("issues.opened", async (context) => {
    await runKnownIssues(context);
  });
};

export async function runKnownIssues(context: Context) {
  if (senderIsBot(context)) return;
  if (senderIsAdmin(context)) return;
  const issueOrPr = context.payload.issue || context.payload.pull_request;
  let found: number;

  KNOWN_ISSUES.forEach(async (issue) => {
    found = 0;
    issue.search.forEach((search) => {
      if (issueOrPr.body.includes(search)) {
        found++;
      }
    });
    if (issue.search.length === found) {
      if (issue.lables) {
        await context.github.issues.addLabels(
          context.issue({ labels: issue.lables })
        );
      }
      await context.github.issues.createComment(
        context.issue({ body: issue.message })
      );
      return;
    }
  });
}
