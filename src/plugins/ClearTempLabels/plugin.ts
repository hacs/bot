import { Application, Context } from "probot";

export const NAME = "ClearTempLabels";

export const initClearTempLabels = (app: Application) => {
  app.on("pull_request", async (context) => {
    await runClearTempLabels(context);
  });
};

export async function runClearTempLabels(context: Context) {
  const CurrentLabels = await context.github.issues.listLabelsOnIssue(
    context.issue()
  );
  CurrentLabels.data.forEach(async (element) => {
    if (element.name === "recheck") {
      await context.github.issues.removeLabel(
        context.issue({ name: "recheck" })
      );
    }
  });
}
