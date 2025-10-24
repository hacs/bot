import { IssuePullPayload, PayloadIsPull, PullPayload } from '../types'

import { defaultCategories, RepositoryName } from '../const'
import { GitHubBot } from '../github.bot'
import { isBlockedAuthor, isBlockedRepository } from '../utils/blocked'
import { convertPullRequestToDraft } from '../utils/convertToDraft'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { extractLinks, extractTasks } from '../utils/tasks'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !PayloadIsPull(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT ||
    !['opened', 'synchronize'].includes(payload.action) ||
    payload.pull_request.state !== 'open' ||
    (payload.action === 'opened' &&
      payload.pull_request.author_association === 'MEMBER')
  ) {
    return
  }

  if (
    payload.pull_request.head.ref === 'master' &&
    payload.action === 'opened'
  ) {
    await bot.github.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: '[Do not submit PRs from your `master` branch.](https://hacs.xyz/docs/publish/include/#additional-information)',
    })
    await bot.github.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }

  if (
    payload.pull_request.head.repo?.full_name !==
      payload.pull_request.base.repo?.full_name &&
    !payload.pull_request.maintainer_can_modify
  ) {
    await bot.github.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: '[Your PR is not editable for maintainers](https://hacs.xyz/docs/publish/include/#additional-information)',
    })
    await convertPullRequestToDraft(bot.github, payload.pull_request.node_id)
    return
  }

  const changedFiles = await getChangedFiles(bot, payload)

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
    await bot.github.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: "PR was not complete, recreate it when it's ready.",
    })
    await bot.github.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }

  const changedRepos = await getFileDiff(bot, payload, repoCategory || '')
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

  if (repo.toLowerCase().includes('hacs')) {
    await bot.github.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: "Do not use 'HACS' as a part of your repository name.",
    })
    await convertPullRequestToDraft(bot.github, payload.pull_request.node_id)
    return
  }

  const { data: repoInfo } = await bot.github.octokit.rest.repos.get({
    owner,
    repo,
  })

  if (isBlockedAuthor(repoInfo.owner.id)) {
    await bot.github.octokit.rest.issues.createComment({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      body: 'The repository belongs to an author that are no longer allowed to publish to HACS, the repository can still be used as a custom repository.',
    })
    await bot.github.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }

  if (isBlockedRepository(repoInfo.id)) {
    await bot.github.octokit.rest.issues.createComment({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      body: 'The repository is blocked from being added to HACS, the repository can still be used as a custom repository.',
    })
    await bot.github.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }

  const pullRequestLinks = extractLinks(payload.pull_request.body || '').filter(
    (link) => link.repository === `${owner}/${repo}`,
  )

  if (pullRequestLinks.length < (repoCategory >= 'integration' ? 3 : 2)) {
    await bot.github.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: `You did not supply the expected links`,
    })
    await bot.github.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
    return
  }

  if (repoInfo.full_name !== newRepo) {
    await bot.github.octokit.rest.pulls.createReview({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      event: 'REQUEST_CHANGES',
      body: `The submitted name \`${newRepo}\` does not match what GitHub returns for the repository (\`${repoInfo.full_name}\`).`,
    })
    await convertPullRequestToDraft(bot.github, payload.pull_request.node_id)
    return
  }

  await bot.github.octokit.rest.issues.addLabels({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    labels: ['New default repository'],
  })

  const newTitle = `Adds new ${repoCategory} [${owner}/${repo}]`

  if (payload.action === 'opened' || newTitle !== payload.pull_request.title) {
    await bot.github.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      title: newTitle,
    })
  }
}

async function getChangedFiles(
  bot: GitHubBot,
  payload: PullPayload,
): Promise<string[]> {
  const { data: listFilesResponse } =
    await bot.github.octokit.rest.pulls.listFiles({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
    })
  return listFilesResponse.map((file) => file.filename)
}

async function getFileDiff(bot: GitHubBot, payload: PullPayload, file: string) {
  const { data: currentContentData } =
    await bot.github.octokit.rest.repos.getContent({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      path: file,
    })

  if (!('content' in currentContentData)) throw Error('No content')
  const currentContent: string[] = JSON.parse(atob(currentContentData.content))

  const { data: changedContentData } =
    await bot.github.octokit.rest.repos.getContent({
      ...extractOwnerRepo(payload),
      issue_number: payload.pull_request.number,
      path: file,
      ref: payload.pull_request.head.sha,
    })

  if (!('content' in changedContentData)) throw Error('No content')
  const changedContent: string[] = JSON.parse(atob(changedContentData.content))

  return changedContent.filter((element) => !currentContent.includes(element))
}
