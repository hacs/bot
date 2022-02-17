import { CheckSuitePayload, IssuePullPayload } from '../types'

export const NAME = 'Filter'
export const ADMINS = ['ludeeus']

export const senderIsAdmin = (
  payload: IssuePullPayload | CheckSuitePayload,
): boolean => ADMINS.includes(payload.sender.login)

export const senderIsBot = (
  payload: IssuePullPayload | CheckSuitePayload,
): boolean => payload.sender.type !== 'User'
