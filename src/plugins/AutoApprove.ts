import { Application } from 'probot'


export const AutoApprove = (app: Application) => {
  app.on("check_run.completed", async context => {
    var message = "## TEST MESSAGE\n";
    const PullNumber = context.payload.check_run.check_suite.pull_requests[0].number
    const { data: Pull } = await context.github.pullRequests.get(
        context.issue({number: PullNumber}))

    var { data: combined } = await context.github.repos.getCombinedStatusForRef(
      context.issue({ref: Pull.head.sha}))

      message += `combined.state: ${combined.state}\n\n`

    if (combined.state !== "pending") {
        await context.github.issues.createComment(
        context.issue({ body: message }))
    }
  });
}; 