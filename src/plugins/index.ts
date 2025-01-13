import type { GitHubBot } from '../github.bot'
import BaseMetrics from './base.metrics'
import issuesClosedIntegration from './issues.closed.integration'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesLabeledSpam from './issues.labeled.spam'
import IssuesOpenedGreeter from './issues.opened.greeter'
import IssuesSlackNotify from './issues.slack.notify'
import PullRequestClosedDefault from './pull_request.closed.default'
import PullRequestClosedIntegration from './pull_request.closed.integration'
import PullRequestLabeledNewDefaultRepository from './pull_request.labeled.new_default_repository'
import PullRequestOpenedDefault from './pull_request.opened.default'
import PullRequestSlackNotify from './pull_request.slack.notify'
import ReleasePublishedIntegration from './release.published.integration'
import WorkflowRunCompeted from './workflow_run.completed'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = (bot: GitHubBot, payload: any) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [BaseMetrics],
  'issues.closed': [issuesClosedIntegration, IssuesSlackNotify],
  'issues.labeled': [
    IssuesLabeledDuplicate,
    IssuesLabeledInvalid,
    IssuesLabeledSpam,
  ],
  'issues.opened': [IssuesOpenedGreeter, IssuesSlackNotify],
  'pull_request.closed': [
    PullRequestClosedDefault,
    PullRequestClosedIntegration,
    PullRequestSlackNotify,
  ],
  'pull_request.labeled': [PullRequestLabeledNewDefaultRepository],
  'pull_request.opened': [PullRequestOpenedDefault, PullRequestSlackNotify],
  'pull_request.synchronize': [PullRequestOpenedDefault],
  'release.published': [ReleasePublishedIntegration],
  'workflow_run.completed': [WorkflowRunCompeted],
}
