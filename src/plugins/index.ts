import type { GitHubBot } from '../github.bot'
import type { IssuePullPayload } from '../types'
import DebugPlugin from './debug'

export const plugins: Record<
  string,
  [(bot: GitHubBot, payload: IssuePullPayload) => Promise<void>]
> = { base: [DebugPlugin] }
