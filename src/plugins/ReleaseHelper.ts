import { Application } from 'probot'
import { ExecutionFilter } from './ExecutionFilter'

export const ReleaseHelper = (app: Application) => {
  app.on("issue_comment.created", async context => {
    if (!ExecutionFilter(context)) return;

    console.log(context)
  });
}
