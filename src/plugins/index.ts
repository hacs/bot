import type { GitHubBot } from '../github.bot'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesLabeledSpam from './issues.labeled.spam'
import IssuesOpenedGreeter from './issues.opened.greeter'
import PullRequestReviewSubmittedChangesRequested from './pull_request_review.submitted.changes_requested'
import PullRequestClosedDefault from './pull_request.closed.default'
import PullRequestLabeledNewDefaultRepository from './pull_request.labeled.new_default_repository'
import PullRequestOpenedDefault from './pull_request.opened.default'
import WorkflowJobWaitingSlack from './workflow_job.waiting.slack'
import WorkflowRunCompeted from './workflow_run.completed'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = (bot: GitHubBot, payload: any) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [],
  'issues.labeled': [
    IssuesLabeledDuplicate,
    IssuesLabeledInvalid,
    IssuesLabeledSpam,
  ],
  'issues.opened': [IssuesOpenedGreeter],
  'pull_request_review.submitted': [PullRequestReviewSubmittedChangesRequested],
  'pull_request.closed': [PullRequestClosedDefault],
  'pull_request.labeled': [PullRequestLabeledNewDefaultRepository],
  'pull_request.ready_for_review': [PullRequestOpenedDefault],
  'pull_request.opened': [PullRequestOpenedDefault],
  'pull_request.synchronize': [PullRequestOpenedDefault],
  'workflow_job.waiting': [WorkflowJobWaitingSlack],
  'workflow_run.completed': [WorkflowRunCompeted],
}
