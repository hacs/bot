import { Application } from 'probot'
import { ExecutionFilter } from './ExecutionFilter'

export const ClearTempLabels = (app: Application) => {
      app.on("pull_request", async context => {
        if (!ExecutionFilter(context)) return;
          const CurrentLabels = await context.github.issues.listLabelsOnIssue(context.issue())
          CurrentLabels.data.forEach(async element => {
            if (element.name === "recheck" ) {
              await context.github.issues.removeLabel(
                context.issue({name: "recheck"}))
            }
        })
    });
};