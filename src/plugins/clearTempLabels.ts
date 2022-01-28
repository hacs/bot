import { App } from 'octokit'
import { PullPayload } from '../types'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'

const tempLabels: string[] = ['recheck']

export default async (app: App, payload: PullPayload): Promise<void> => {
  const { data: CurrentLabels } =
    await app.octokit.rest.issues.listLabelsOnIssue({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
    })
  CurrentLabels.forEach(async (element) => {
    if (tempLabels.includes(element.name)) {
      await app.octokit.rest.issues.removeLabel({
        ...extractOwnerRepo(payload),
        issue_number: payload.pull_request.number,
        name: element.name,
      })
    }
  })
}
