import { App } from 'octokit'
import { PullPayload } from '../types'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'

const tempLabels: string[] = ['recheck']

export default async (app: App, payload: PullPayload): Promise<void> => {
  if (!['labeled'].includes(payload.action)) {
    return
  }

  const { data: CurrentLabels } =
    await app.octokit.rest.issues.listLabelsOnIssue({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
    })

  await app.octokit.rest.issues.setLabels({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    labels: CurrentLabels.map((label) => label.name).filter(
      (label) => !tempLabels.includes(label),
    ),
  })
}
