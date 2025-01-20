import { IssuePullPayload, PayloadIsPull } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { defaultCategories, RepositoryName } from '../const'
import { postDiscordMessage } from '../utils/postDiscordMessage'

const messageCommon = `
Your repository is now added to HACS :tada:
Here is a few resources that can be useful:
- [HACS Discord](https://discord.gg/apgchf8) If you have questions about HACS this is the best place for it.
- [Home Assistant Developer Blog](https://developers.home-assistant.io/blog) Make sure you stay up to date.
- [Home Assistant Devs @ twitter](https://twitter.com/hass_devs)
- [HACS @ twitter](https://twitter.com/HACSIntegration)

_It might take up to 8 hours before it shows up._
`

const messagePlugins = `- [Did you know you can add your card to the card-picker in Lovelace?](https://developers.home-assistant.io/docs/lovelace_custom_card#graphical-card-configuration)`

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

  console.log(owner_repo)
  console.log(category)

  if (!defaultCategories.includes(category)) {
    console.debug(`${category} not in ${defaultCategories.join(', ')}`)
    return
  }

  const { data: repoAdded } = await bot.github.octokit.rest.repos.get({
    owner: owner_repo.split('/')[0],
    repo: owner_repo.split('/')[1],
  })

  console.log(JSON.stringify(repoAdded))

  await postDiscordMessage({
    embeds: [
      {
        title: 'New repository added to HACS :tada:',
        color: '3066993',
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
            value: repoAdded.description,
          },
        ],
      },
    ],
  })

  /*
  await bot.github.octokit.rest.issues.createComment({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    body: [messageCommon, category === 'plugin' ? messagePlugins : undefined]
      .filter((entry) => entry !== undefined)
      .join('\n'),
  })
   */
}
