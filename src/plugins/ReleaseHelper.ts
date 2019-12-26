import { Application } from "probot";
import { ExecutionFilter } from "./ExecutionFilter";
import { IsAdmin } from "./ExecutionFilter";

export const ReleaseHelper = (app: Application) => {
  app.on("issue_comment.created", async context => {
    if (!ExecutionFilter(context)) return;
    if (!context.payload.issue.title.startsWith("Create release ")) return;
    if (!context.payload.comment.body.startsWith("@hacs-bot ")) return;

    const title: string = context.payload.issue.title;
    let version: string = title.replace("Create release ", "").replace("?", "");
    const commentid: number = context.payload.comment.id;
    const command: string = (context.payload.comment.body as string).replace(
      "@hacs-bot ",
      ""
    );

    console.log(
      `Command ${command} requested by ${context.payload.sender.login}`
    );

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

    if (["yes", "lgtm"].includes(command.toLowerCase())) {
      await context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "+1" })
      );
      await context.github.issues.createComment(
        context.issue({
          body: `Creating release with release number ${version}`
        })
      );
    }

    if (command.toLowerCase().startsWith("release")) {
      version = command.split("release ")[0];
      await context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "+1" })
      );
      await context.github.issues.createComment(
        context.issue({
          body: `Creating release with release number ${version}`
        })
      );
    }
  });
};
