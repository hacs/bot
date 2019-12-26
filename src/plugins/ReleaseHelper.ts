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
      return;
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
      await context.github.repos.createRelease(
        context.repo({ tag_name: version })
      );

      const release = await context.github.repos.getLatestRelease(
        context.repo()
      );

      await context.github.issues.createComment(
        context.issue({
          body: `The new release is published here ${release.data.html_url}`
        })
      );
      await context.github.issues.update(context.issue({ state: "closed" }));
    }

    if (command.toLowerCase().startsWith("release")) {
      version = command.replace("release ", "");
      await context.github.reactions.createForIssueComment(
        context.issue({ comment_id: commentid, content: "+1" })
      );
      await context.github.issues.createComment(
        context.issue({
          body: `Creating release with release number ${version}`
        })
      );
      await context.github.repos.createRelease(
        context.repo({ tag_name: version })
      );
      const release = await context.github.repos.getLatestRelease(
        context.repo()
      );

      await context.github.issues.createComment(
        context.issue({
          body: `The new release is published here ${release.data.html_url}`
        })
      );
      await context.github.issues.update(context.issue({ state: "closed" }));
    }
  });
};
