import { App } from 'octokit'
import { defaultCategories, RepositoryName } from '../const'
import { PullPayload } from '../types'

import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'
import { postDiscordMessage } from '../utils/postDiscordMessage'

const messageCommon = `
Your repository is now added to HACS :tada:
Here is a few resources that can be useful:
- [HACS Discord][hacsdiscord] If you have questions about HACS this is the best place for it.
- [Home Assistant Developer Blog][hadevblog] Make sure you stay up to date.
- [Home Assistant Devs @ twitter][hadevtwitter]
- [HACS @ twitter][hacstwitter]
- [Use this GitHub action to validate your repository with HACS][hacsaction]
`

const messageIntegrations = `- [Use hassfest to validate your integration with this GitHub Action][hassfestaction]`

const messagePlugins = `- [Did you know you can add your card to the card-picker in Lovelace?][lovelace_custom_card]`

const messageLinks = `
<!-- Links -->
[hacsdiscord]: https://discord.gg/apgchf8
[hacsaction]: https://hacs.xyz/docs/publish/action
[hacstwitter]: https://twitter.com/HACSIntegration
[hadevblog]: https://developers.home-assistant.io/blog
[hadevtwitter]: https://twitter.com/hass_devs
[hassfestaction]: https://github.com/home-assistant/actions#hassfest
[lovelace_custom_card]: https://developers.home-assistant.io/docs/lovelace_custom_card#graphical-card-configuration
`

export default async (app: App, payload: PullPayload): Promise<void> => {
  if (
    senderIsBot(payload) ||
    extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT ||
    !['closed'].includes(payload.action)
  )
    return

  const { data: pull } = await app.octokit.rest.pulls.get({
    ...extractOwnerRepo(payload),
    pull_number: payload.pull_request.number,
  })

  const titleElements = pull.title.split(' ')
  const owner_repo = titleElements[3].replace('[', '').replace(']', '')
  const category = titleElements[2].toLowerCase()

  if (!defaultCategories.includes(category)) {
    console.debug(`${category} not in ${defaultCategories.join(', ')}`)
    return
  }

  if (!pull.merged) {
    console.debug('Did not merge')
    return
  }

  const { data: repoAdded } = await app.octokit.rest.repos.get({
    owner: owner_repo.split('/')[0],
    repo: owner_repo.split('/')[1],
  })

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

  let body: string = messageCommon

  if (category === 'integration') {
    body += messageIntegrations
  }

  if (category === 'plugin') {
    body += messagePlugins
  }

  await app.octokit.rest.issues.createComment({
    ...extractOwnerRepo(payload),
    issue_number: payload.pull_request.number,
    body: body + messageLinks,
  })
}
