import { App } from 'octokit'

export const getNextMilestone = async (app: App) => {
  const { data: milestones } = await app.octokit.rest.issues.listMilestones({
    owner: 'hacs',
    repo: 'payload',
  })

  return milestones.find((milestone) => milestone.title === 'next')
}
