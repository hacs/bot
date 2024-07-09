import type { GitHubBot } from '../github.bot'
import type { IssuePullPayload } from '../types'
import DebugPlugin from './debug'
import DuplicateIssuePlugin from './issues.labeled.duplicate'

export const plugins: Record<
  string,
  [(bot: GitHubBot, payload: IssuePullPayload) => Promise<void>]
> = { base: [DebugPlugin], 'issues.labeled': [DuplicateIssuePlugin] }
