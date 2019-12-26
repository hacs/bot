import { Application } from "probot";
import { ExecutionFilter } from "./ExecutionFilter";
import { IsAdmin } from "./ExecutionFilter";

export const ReleaseHelper = (app: Application) => {
  app.on("issue_comment.created", async context => {
    if (!ExecutionFilter(context)) return;
    if (!context.payload.comment.body.startsWith("@hacs-bot ")) return;

    const commentid: number = context.payload.comment.id;
    const command: string = context.payload.comment.body
      .split("@hacs-bot ")[0]
      .toLowerCase();

    if (!IsAdmin(context)) {
      context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "confused" })
      );
    }

    if (["no", "close"].includes(command)) {
      context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "+1" })
      );
      context.github.issues.update(context.issue({ state: "closed" }));
    }
  });
};
