import { App } from 'octokit'

export const convertPullRequestToDraft = async (
  app: App,
  nodeId: string,
): Promise<void> => {
  await app.octokit.graphql({
    query: `mutation { convertPullRequestToDraft(input: {pullRequestId: "${nodeId}"}) {clientMutationId}}`,
  })
}
