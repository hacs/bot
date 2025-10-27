import { IssuePullPayload, PayloadIsPull } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { defaultCategories, RepositoryName } from '../const'

const messageCommon = `
Congratulations! Your repository has been added to HACS :tada:

**Your repository has been approved:**
Your repository has been successfully merged into the HACS default repository list.
It might take up to **8 hours** before your repository appears in HACS for users.

**Resources:**
- [HACS Discord](https://discord.gg/apgchf8)
- [Home Assistant Developer Blog](https://developers.home-assistant.io/blog)

`

const messagePlugins = `
**For dashboard card developers:**
Did you know you can add your card to the card-picker in Lovelace? This makes it easier for users to discover and add your card through the UI.

- [Learn how to add your card to the card-picker](https://developers.home-assistant.io/docs/lovelace_custom_card#graphical-card-configuration)
- Adding a card picker entry improves the user experience significantly
- Users can configure your card visually instead of editing YAML

`

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !PayloadIsPull(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT ||
    payload.action !== 'closed'
  ) {
    return
  }

  const { data: pull } = await bot.github.octokit.rest.pulls.get({
    ...extractOwnerRepo(payload),
    pull_number: payload.pull_request.number,
  })

  if (!pull.merged) {
    console.debug('Did not merge')
    return
  }

  const titleElements = pull.title.split(' ')
  const owner_repo = titleElements[3].replace('[', '').replace(']', '')
  const category = titleElements[2].toLowerCase()

  if (!defaultCategories.includes(category)) {
    console.debug(`${category} not in ${defaultCategories.join(', ')}`)
    return
  }

  const { data: repoAdded } = await bot.github.octokit.rest.repos.get({
    owner: owner_repo.split('/')[0],
    repo: owner_repo.split('/')[1],
  })

  await bot.discordMessage({
    webhookUrl: bot.env.DISCORD_WEBHOOK,
    embeds: [
      {
        title: 'New repository added to HACS :tada:',
        color: 3066993,
        fields: [
          {
            name: 'Repository link',
            value: repoAdded.html_url,
          },
          {
            name: 'Category',
            value: category,
          },
          {
            name: 'Description',
            value: repoAdded.description ?? '',
          },
        ],
      },
    ],
  })

  await bot.github.octokit.rest.issues.createComment({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    body: [
      messageCommon,
      category === 'plugin' ? messagePlugins : undefined,
      'Thank you for contributing to the Home Assistant community! :tada:',
    ]
      .filter((entry) => entry !== undefined)
      .join('\n'),
  })
}
