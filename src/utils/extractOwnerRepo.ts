import { CheckSuitePayload, IssuePullPayload } from '../types'

export interface OwnerRepo {
  owner: string
  repo: string
}

export const extractOwnerRepo = (
  payload: IssuePullPayload | CheckSuitePayload,
): OwnerRepo => {
  const repository = payload.repository.full_name
  return {
    owner: repository.split('/')[0],
    repo: repository.split('/')[1],
  }
}
