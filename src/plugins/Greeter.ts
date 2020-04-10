import { Application, Context } from "probot";
import { messageNewIssue } from "../messages";
import { extractLabels } from "../util/extractLabels";

export const NAME = "Greeter";

export const initGreeter = (app: Application) => {
  app.on("issues.opened", async (context) => {
    await runGreeter(context);
  });
};

export async function runGreeter(context: Context) {
  const isInvalid: boolean = extractLabels(context)
    .map((label) => label.name)
    .includes("invalid");

  if (isInvalid) {
    return;
  }
  await context.github.issues.createComment(
    context.issue({ body: messageNewIssue })
  );
}
