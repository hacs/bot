import type { GitHubBot } from '../github.bot'
import BaseMetrics from './base.metrics'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesLabeledNewDefaultRepository from './issues.labeled.new_default_repository'
import IssuesOpenedGreeter from './issues.opened.greeter'
import WorkflowRunCompeted from './workflow_run.completed'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = (bot: GitHubBot, payload: any) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [BaseMetrics],
  'issues.labeled': [
    IssuesLabeledDuplicate,
    IssuesLabeledInvalid,
    IssuesLabeledNewDefaultRepository,
  ],
  'issues.opened': [IssuesOpenedGreeter],
  'workflow_run.completed': [WorkflowRunCompeted],
}
