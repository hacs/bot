import { Application } from "probot";
import { ExecutionFilter } from "./ExecutionFilter";
import { IsAdmin } from "./ExecutionFilter";

export const ReleaseHelper = (app: Application) => {
  app.on("issue_comment.created", async context => {
    if (!ExecutionFilter(context)) return;
    if (!context.payload.comment.body.startsWith("@hacs-bot ")) return;

    const commentid: number = context.payload.comment.id;
    const command: string = (context.payload.comment.body as string).replace(
      "@hacs-bot ",
      ""
    );

    console.log(
      `Command ${command} requested by ${context.payload.sender.login}`
    );

    const title: string = context.payload.issue.title;

    console.log(title);
    console.log(title.startsWith("Create release "));
    console.log(title.replace("Create release ", "").replace("?", ""));

    if (!IsAdmin(context)) {
      await context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "confused" })
      );
    }

    if (["no", "close"].includes(command.toLowerCase())) {
      await context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "+1" })
      );
      await context.github.issues.update(context.issue({ state: "closed" }));
    }
  });
};
