import { Application } from "probot";

export const ClearTempLabels = (app: Application) => {
  app.on("pull_request", async (context) => {
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
  });
};
