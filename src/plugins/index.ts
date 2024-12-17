import type { GitHubBot } from '../github.bot'
import BaseMetrics from './base.metrics'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesOpenedGreeter from './issues.opened.greeter'
import PullRequestClosedDefault from './pull_request.closed.default'
import PullRequestLabeledNewDefaultRepository from './pull_request.labeled.new_default_repository'
import PullRequestOpenedDefault from './pull_request.opened.default'
import WorkflowRunCompeted from './workflow_run.completed'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = (bot: GitHubBot, payload: any) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [BaseMetrics],
  'issues.labeled': [IssuesLabeledDuplicate, IssuesLabeledInvalid],
  'issues.opened': [IssuesOpenedGreeter],
  'pull_request.closed': [PullRequestClosedDefault],
  'pull_request.labeled': [PullRequestLabeledNewDefaultRepository],
  'pull_request.opened': [PullRequestOpenedDefault],
  'pull_request.synchronize': [PullRequestOpenedDefault],
  'workflow_run.completed': [WorkflowRunCompeted],
}
