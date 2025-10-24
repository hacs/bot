import { IssuePullPayload, PayloadIsIssue } from '../types'

import { GitHubBot } from '../github.bot'
import { extractOwnerRepo } from '../utils/extractOwnerRepo'
import { senderIsBot } from '../utils/filter'

export default async (
  bot: GitHubBot,
  payload: IssuePullPayload,
): Promise<void> => {
  if (
    senderIsBot(payload) ||
    !PayloadIsIssue(payload) ||
    payload.action !== 'opened'
  ) {
    return
  }

  if (extractOwnerRepo(payload).repo !== 'integration') {
    await bot.github.octokit.rest.issues.createComment({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      body: `Thank you for your interest in HACS.

**This issue was opened in the wrong repository:**
Issues should be opened in the [hacs/integration](https://github.com/hacs/integration/issues) repository, not here.

**Why this repository is incorrect:**
This repository is not where HACS issues are tracked. The main HACS integration repository is the correct place for bug reports.

**What you need to do:**

**If you have a bug report:**
1. **Open a new issue** in the [hacs/integration](https://github.com/hacs/integration/issues) repository
2. **Use the issue template** - Fill out the entire template to help maintainers and community members understand and address your issue
3. **Include relevant details** - The more information you provide, the faster you'll get help

**If you have questions or need help:**
- [HACS Discord](https://discord.gg/apgchf8) - Get help from the community for questions, installation, or configuration issues
- [HACS Documentation](https://hacs.xyz) - Find answers to common questions

**Important resources:**

- [Issue Guidelines](https://hacs.xyz/docs/issues) - Read this before creating bug reports

**What happens to this issue:**
This issue will be closed and locked automatically since it was opened in the wrong repository. Please don't reopen it here.`,
    })
    await bot.github.octokit.rest.issues.update({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
      state: 'closed',
    })
    await bot.github.octokit.rest.issues.lock({
      ...extractOwnerRepo(payload),
      issue_number: payload.issue.number,
    })
    return
  }

  await bot.github.octokit.rest.issues.createComment({
    ...extractOwnerRepo(payload),
    issue_number: payload.issue.number,
    body: `Thank you for opening an issue in the HACS.

**Before proceeding, please verify the following:**

**Select the correct issue template:**
HACS provides different templates for different types of bugs. Choosing the right template ensures you're asked the right questions and helps route your bug appropriately.

**Complete the ENTIRE issue template:**
Make sure you've read the [issue guidelines](https://hacs.xyz/docs/issues) and filled out **every single field** in the issue template, even if some fields seem unrelated to your specific situation.

**Fill out everything, even if it seems unnecessary:**
Don't skip fields because they "don't seem relevant" to your bug. The template asks for specific information because:

- Problems often have unexpected causes that surface through "unrelated" details
- What seems unrelated to you might be the key to solving your bug
- Incomplete information requires follow-up questions, delaying resolution
- The template is designed based on years of troubleshooting experience
- Missing information forces those helping to make assumptions, which can lead to wrong solutions

**Issues with incomplete templates take significantly longer to resolve** or may be closed without resolution.

**If you're experiencing a similar bug:**
If your bug is identical to an existing one, please:

- **Add a 👍 reaction** to the original issue description
- **Subscribe to notifications** on that issue to stay updated
- **Do not add comments** like "same here", "I have this too", or "+1"

Adding duplicate comments creates noise and makes it harder to track and resolve issues. Reactions help prioritize issues based on how many users are affected.

**Getting help:**
If you need assistance filling out the template or understanding your issue:

- [Issue Guidelines](https://hacs.xyz/docs/issues) - Detailed instructions for reporting issues
- [HACS Discord](https://discord.gg/apgchf8) - Community support and real-time help

**What happens next:**
Maintainers and community members will review your issue and may:

- Ask for additional information if the template is incomplete
- Provide a solution or workaround
- Label the issue appropriately for tracking
- Link it to related issues or pull requests`,
  })
}
