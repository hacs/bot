import { Application } from 'probot'


export const AutoApprove = (app: Application) => {
  app.on("pull_request", async context => {
    var message = "## TEST MESSAGE\n";
    const { data: Pull } = await context.github.pullRequests.get(context.issue())

    var { data: combined } = await context.github.repos.getCombinedStatusForRef(
      context.issue({ref: Pull.head.sha}))

      message += `combined.state: ${combined.state}\n\n`

    if (combined.state !== "pending") {
        await context.github.issues.createComment(
        context.issue({ body: message }))
    }
  });
}; 