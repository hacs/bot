import { App } from 'octokit'

export const getNextMilestone = async (app: App) => {
  const { data: milestones } = await app.octokit.rest.issues.listMilestones({
    owner: 'hacs',
    repo: 'integration',
  })

  return milestones.find((milestone) => milestone.title === 'next')
}
