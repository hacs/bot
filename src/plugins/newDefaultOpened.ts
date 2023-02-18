import { App } from 'octokit'
import { defaultCategories, RepositoryName } from '../const'
import { PullPayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { extractTasks } from '../utils/tasks'

export default async (app: App, payload: PullPayload): Promise<void> => {
  if (
    senderIsBot(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT ||
    !['opened', 'synchronize'].includes(payload.action)
  )
    return

  const changedFiles = await getChangedFiles(app, payload)

  if (changedFiles.length > 1) {
    return
  }

  const repoCategory = changedFiles.pop()
  const completedTasks = extractTasks(payload.pull_request.body || '').filter(
    (t) => t.checked,
  )
  if (
    payload.action == 'opened' &&
    completedTasks.length !== (repoCategory === 'integration' ? 6 : 5)
  ) {
    await app.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }
  const changedRepos = await getFileDiff(app, payload, repoCategory || '')

  const newRepo = changedRepos.pop()
  if (newRepo === undefined) throw Error('No repo')

  const owner = newRepo.split('/')[0]
  const repo = newRepo.split('/')[1]

  if (
    repo.toLowerCase().includes('hacs') &&
    payload.pull_request.review_comments === 0
  ) {
    await app.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: "Do not use 'HACS' as a part of your repository name.",
    })
    return
  }

  await app.octokit.rest.issues.addLabels({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    labels: ['New default repository'],
  })

  const newTitle = `Adds new ${repoCategory} [${owner}/${repo}]`

  if (payload.action === 'opened' || newTitle !== payload.pull_request.title) {
    await app.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      title: newTitle,
    })
    await app.octokit.rest.issues.createComment({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      body: `Running checks on [${owner}/${repo}](https://github.com/${owner}/${repo})`,
    })
  }
}

async function getChangedFiles(
  app: App,
  payload: PullPayload,
): Promise<string[]> {
  const { data: listFilesResponse } = await app.octokit.rest.pulls.listFiles({
    ...extractOwnerRepo(payload),
    pull_number: payload.pull_request.number,
  })
  return listFilesResponse
    .filter((file) => defaultCategories.includes(file.filename))
    .map((file) => file.filename)
}

async function getFileDiff(app: App, payload: PullPayload, file: string) {
  const { data: currentContentData } = await app.octokit.rest.repos.getContent({
    ...extractOwnerRepo(payload),
    pull_number: payload.pull_request.number,
    path: file,
  })

  if (!('content' in currentContentData)) throw Error('No content')
  const currentContent: string[] = JSON.parse(atob(currentContentData.content))

  const { data: changedContentData } = await app.octokit.rest.repos.getContent({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    path: file,
    ref: payload.pull_request.head.sha,
  })

  if (!('content' in changedContentData)) throw Error('No content')
  const changedContent: string[] = JSON.parse(atob(changedContentData.content))

  return changedContent.filter((element) => !currentContent.includes(element))
}
