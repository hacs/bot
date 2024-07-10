import type { GitHubBot } from '../github.bot'
import type { IssuePullPayload } from '../types'
import DebugPlugin from './debug'
import IssuesLabeledDuplicate from './issues.labeled.duplicate'
import IssuesLabeledInvalid from './issues.labeled.invalid'
import IssuesOpenedGreeter from './issues.opened.greeter'

type Plugin = (bot: GitHubBot, payload: IssuePullPayload) => Promise<void>

export const plugins: Record<string, Plugin[]> = {
  base: [DebugPlugin],
  'issues.labeled': [IssuesLabeledDuplicate, IssuesLabeledInvalid],
  'issues.opened': [IssuesOpenedGreeter],
}
