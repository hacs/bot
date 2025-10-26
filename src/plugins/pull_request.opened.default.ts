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

  const issues: string[] = []
  let shouldClose = false
  let shouldDraft = false

  if (
    payload.pull_request.head.ref === 'master' &&
    payload.action === 'opened'
  ) {
    issues.push(
      '**Do not submit PRs from your `master` branch.** Please create a new branch and submit your PR from that branch instead. [Learn more](https://hacs.xyz/docs/publish/include/#additional-information)',
    )
    shouldClose = true
  }

  if (
    payload.pull_request.head.repo?.full_name !==
      payload.pull_request.base.repo?.full_name &&
    !payload.pull_request.maintainer_can_modify
  ) {
    issues.push(
      '**Allow maintainers to edit this PR.** When creating a PR, you must enable the "Allow edits from maintainers" option. [Learn more](https://hacs.xyz/docs/publish/include/#additional-information)',
    )
    shouldDraft = true
  }

  if (issues.length > 0) {
    await handleIssues(bot, payload, issues, shouldClose, shouldDraft)
    return
  }

  const changedFiles = await getChangedFiles(bot, payload)

  if (changedFiles.length > 1) {
    issues.push(
      `**Limit your PR to a single file change.** This PR modifies ${changedFiles.length} files. Please create separate PRs for each repository you want to add.`,
    )
    shouldDraft = true
    await handleIssues(bot, payload, issues, shouldClose, shouldDraft)
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
    issues.push(
      '**Complete all checklist items before submitting.** Please check all the required boxes and create a new PR when ready.',
    )
    shouldDraft = true
  }

  const changedRepos = await getFileDiff(bot, payload, repoCategory || '')
  if (changedRepos.length > 1) {
    issues.push(
      '**Limit your PR to a single repository change.** This PR changes multiple repositories to the same file. Please create separate PRs for each repository.',
    )
    shouldDraft = true
    await handleIssues(bot, payload, issues, shouldClose, shouldDraft)
    return
  }

  const newRepo = changedRepos.pop()
  if (newRepo === undefined) throw Error('No repo')

  const owner = newRepo.split('/')[0]
  const repo = newRepo.split('/')[1]

  if (!owner || !repo) {
    return
  }

  const { data: repoInfo } = await bot.github.octokit.rest.repos.get({
    owner,
    repo,
  })

  if (repo.toLowerCase().includes('hacs')) {
    issues.push(
      '**Remove "HACS" from your repository name.** Repository names cannot contain "HACS" to avoid confusion with the official HACS project. Please rename your repository and update this PR.',
    )
    shouldDraft = true
  }

  if (isBlockedAuthor(repoInfo.owner.id)) {
    issues.push(
      '**This author is blocked from publishing to HACS.** The repository owner is no longer allowed to publish new repositories to HACS. The repository can still be used as a custom repository.',
    )
    shouldClose = true
  }

  if (isBlockedRepository(repoInfo.id)) {
    issues.push(
      '**This repository is blocked from being added to HACS.** This specific repository cannot be added to the default store. The repository can still be used as a custom repository.',
    )
    shouldClose = true
  }

  const pullRequestLinks = extractLinks(payload.pull_request.body || '').filter(
    (link) => link.repository === `${owner}/${repo}`,
  )

  const expectedNumberOfLinks = repoCategory === 'integration' ? 3 : 2
  if (pullRequestLinks.length < expectedNumberOfLinks) {
    issues.push(
      `**Add required repository links to the PR description.** Found ${pullRequestLinks.length} link(s), but ${expectedNumberOfLinks} are required for ${repoCategory} repositories. Please add links to the repository's latest release and CI action runs.`,
    )
    shouldDraft = true
  }

  if (repoInfo.full_name !== newRepo) {
    issues.push(
      `**Repository name case mismatch.** The submitted name \`${newRepo}\` does not match GitHub's actual repository name \`${repoInfo.full_name}\`. Please update your submission to use the exact case-sensitive repository name.`,
    )
    shouldDraft = true
  }

  if (issues.length > 0) {
    await handleIssues(bot, payload, issues, shouldClose, shouldDraft)
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

async function handleIssues(
  bot: GitHubBot,
  payload: PullPayload,
  issues: string[],
  shouldClose: boolean,
  shouldDraft: boolean,
): Promise<void> {
  const body =
    issues.length > 1
      ? issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')
      : issues[0]

  await bot.github.octokit.rest.pulls.createReview({
    ...extractOwnerRepo(payload),
    pull_number: payload.pull_request.number,
    event: 'REQUEST_CHANGES',
    body,
  })

  if (shouldClose) {
    await bot.github.octokit.rest.pulls.update({
      ...extractOwnerRepo(payload),
      pull_number: payload.pull_request.number,
      state: 'closed',
    })
  } else if (shouldDraft) {
    await convertPullRequestToDraft(bot.github, payload.pull_request.node_id)
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

  const currentSet = new Set(currentContent)
  const changedSet = new Set(changedContent)

  const additions = changedContent.filter((element) => !currentSet.has(element))
  const removals = currentContent.filter((element) => !changedSet.has(element))

  return [...additions, ...removals]
}
