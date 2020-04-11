import { Application } from "probot";
import { senderIsAdmin, senderIsBot } from "../filter";

const ClosedMessage: string = `
This issue is closed, closed issues are ignored.

If you have issues similar to this, please open a seperate issue.
https://github.com/custom-components/hacs/issues/new/choose

And remember to fill out the entire issue template :)
`;

export const ClosedIssue = (app: Application) => {
  app.on("issue_comment.created", async (context) => {
    if (senderIsAdmin(context) || senderIsBot(context)) return;
    const { data: Issue } = await context.github.issues.get(context.issue());

    if (Issue.state === "closed") {
      await context.github.issues.createComment(
        context.issue({ body: ClosedMessage })
      );

      // If things get to bad, implement this:
      //await context.github.issues.lock(context.issue())
    }
  });
};
