import type { GitHubBot } from '../github.bot'
import issuesClosedIntegration from './issues.closed.integration'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesLabeledSpam from './issues.labeled.spam'
import IssuesOpenedGreeter from './issues.opened.greeter'
import PullRequestClosedDefault from './pull_request.closed.default'
import PullRequestClosedIntegration from './pull_request.closed.integration'
import PullRequestLabeledNewDefaultRepository from './pull_request.labeled.new_default_repository'
import PullRequestOpenedDefault from './pull_request.opened.default'
import ReleasePublishedIntegration from './release.published.integration'
import WorkflowJobWaitingSlack from './workflow_job.waiting.slack'
import WorkflowRunCompeted from './workflow_run.completed'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = (bot: GitHubBot, payload: any) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [],
  'issues.closed': [issuesClosedIntegration],
  'issues.labeled': [
    IssuesLabeledDuplicate,
    IssuesLabeledInvalid,
    IssuesLabeledSpam,
  ],
  'issues.opened': [IssuesOpenedGreeter],
  'pull_request.closed': [
    PullRequestClosedDefault,
    PullRequestClosedIntegration,
  ],
  'pull_request.labeled': [PullRequestLabeledNewDefaultRepository],
  'pull_request.opened': [PullRequestOpenedDefault],
  'pull_request.synchronize': [PullRequestOpenedDefault],
  'release.published': [ReleasePublishedIntegration],
  'workflow_job.waiting': [WorkflowJobWaitingSlack],
  'workflow_run.completed': [WorkflowRunCompeted],
}
