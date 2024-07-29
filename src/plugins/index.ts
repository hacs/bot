import type { GitHubBot } from '../github.bot'
import DebugPlugin from './debug'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesOpenedGreeter from './issues.opened.greeter'
import WorkflowRunCompeted from './workflow_run.completed'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = (bot: GitHubBot, payload: any) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [DebugPlugin],
  'issues.labeled': [IssuesLabeledDuplicate, IssuesLabeledInvalid],
  'issues.opened': [IssuesOpenedGreeter],
  'workflow_run.completed': [WorkflowRunCompeted],
}
