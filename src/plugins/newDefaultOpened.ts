import { App } from 'octokit'
import { defaultCategories, RepositoryName } from '../const'
import { PullPayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { extractTasks } from '../utils/tasks'
import { convertPullRequestToDraft } from '../utils/convertToDraft'

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

  const repoCategory = changedFiles
    .filter((filename) => defaultCategories.includes(filename))
    .pop()
  if (
    !repoCategory ||
    ![
      'appdaemon',
      'integration',
      'plugin',
      'python_script',
      'template',
      'theme',
    ].includes(repoCategory)
  ) {
    return
  }

  const completedTasks = extractTasks(payload.pull_request.body || '').filter(
    (t) => t.checked,
  )
  if (
    payload.action == 'opened' &&
    completedTasks.length !== (repoCategory === 'integration' ? 6 : 5)
  ) {
    await app.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: "PR was not complete, recreate it when it's ready.",
    })
    await app.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }

  const changedRepos = await getFileDiff(app, payload, repoCategory || '')
  if (changedRepos.length > 1) {
    throw Error('Multiple repositories changed')
  }

  const newRepo = changedRepos.pop()
  if (newRepo === undefined) throw Error('No repo')

  const owner = newRepo.split('/')[0]
  const repo = newRepo.split('/')[1]

  if (!owner || !repo) {
    return
  }
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
    await convertPullRequestToDraft(app, payload.pull_request.node_id)
    return
  }

  const { data: repoInfo } = await app.octokit.rest.repos.get({ owner, repo })

  if (repoInfo.full_name !== newRepo) {
    await app.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: `The submitted name \`${newRepo}\` does not match what GitHub returns for the repository (\`${repoInfo.full_name}\`).`,
    })
    await convertPullRequestToDraft(app, payload.pull_request.node_id)
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
  return listFilesResponse.map((file) => file.filename)
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
