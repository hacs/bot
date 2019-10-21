import { Application } from 'probot'


export const AutoApprove = (app: Application) => {
  app.on("pull_request", async context => {
    if (context.isBot) return;
    var message = "## TEST MESSAGE\n";
    const { data: Pull } = await context.github.pullRequests.get(context.issue())

    message += `Pull.state: ${Pull.state}\n\n`
    message += `Pull.mergeable: ${Pull.mergeable}\n\n`


    var { data: combined } = await context.github.repos.getCombinedStatusForRef(
      context.issue({ref: Pull.head.sha}))

      message += `combined.state: ${combined.state}\n\n`
      message += `combined.statuses: ${combined.statuses}\n\n`


    await context.github.issues.createComment(
      context.issue({ body: message }))
  });
};