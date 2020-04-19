import { Application, Context } from "probot";
import { senderIsAdmin, senderIsBot } from "../../util/filter";
import { messageClosedIssue } from "../../messages";

export const NAME = "ClosedIssue";

export const initClosedIssue = (app: Application) => {
  app.on(["issue_comment.created"], async (context) => {
    await runClosedIssue(context);
  });
};

export async function runClosedIssue(context: Context) {
  if (
    senderIsAdmin(context) ||
    senderIsBot(context) ||
    context.payload.hasOwnProperty("pull_request") ||
    context.payload.issue.hasOwnProperty("pull_request")
  )
    return;
  const { data: Issue } = await context.github.issues.get(context.issue());

  if (Issue.state === "closed") {
    await context.github.issues.createComment(
      context.issue({ body: messageClosedIssue })
    );

    // If things get to bad, implement this:
    //await context.github.issues.lock(context.issue())
  }
}
