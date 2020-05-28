import { Application, Context } from "probot";
import { senderIsBot } from "../../util/filter";

export const NAME = "Commands";

export const initCommands = (app: Application) => {
  app.on(["issue_comment.created"], async (context) => {
    await runCommands(context);
  });
};

export async function runCommands(context: Context) {
  if (senderIsBot(context)) return;
  if (!context.payload.comment.body.startsWith("/")) return;

  const commentid: number = context.payload.comment.id;
  const command: string = context.payload.comment.body as string;

  console.log(
    `Command ${command} requested by ${context.payload.sender.login}`
  );

  if (command === "/recheck") {
    await context.github.reactions.createForIssueComment(
      context.issue({ comment_id: commentid, content: "+1" })
    );
    await context.github.issues.addLabels(
      context.issue({ labels: ["recheck"] })
    );
    return;
  }
}
