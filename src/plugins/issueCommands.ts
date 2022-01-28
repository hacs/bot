import { App } from 'octokit'
import { IssueCommentPayload } from '../types'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'

export default async (
  app: App,
  payload: IssueCommentPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !['created'].includes(payload.action) ||
    !payload.comment.body.startsWith('/')
  )
    return

  const commentid = payload.comment.id
  const command = payload.comment.body

  console.log(`Command ${command} requested by ${payload.sender.login}`)

  if (command === '/recheck') {
    await app.octokit.rest.reactions.createForIssueComment({
      ...extractOwnerRepo(payload),
      comment_id: commentid,
      content: '+1',
    })
    await app.octokit.rest.issues.addLabels({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      labels: ['recheck'],
    })
    return
  }
}
