import { App } from 'octokit'
import { IssuePullPayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'

export default async (app: App, payload: IssuePullPayload): Promise<void> => {
  console.debug('DebugPlugin', {
    extractOwnerRepo: extractOwnerRepo(payload),
    payload: payload,
  })
}
