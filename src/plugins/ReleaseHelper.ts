import { Application } from 'probot'
import { ExecutionFilter } from './ExecutionFilter'
import { IsAdmin } from './ExecutionFilter'

export const ReleaseHelper = (app: Application) => {
  app.on("issue_comment.created", async context => {
    if (!ExecutionFilter(context)) return;

    console.log(context.payload.comment)
    console.log(context.payload.sender)

    console.log("is admin?", IsAdmin(context))
  });
}
