import { Context } from 'probot'
import { StatusIconDescription, StatusFailed, StatusSuccess } from './StatusIconDescription'

export async function ThemeCheck(context: Context, owner: string, repo: string) {
    const {data: PR} = await context.github.pullRequests.get(context.issue())
    const PRSHA = PR.head.sha
    var conclusion: "success" | "failure" | "neutral" = "success"
    let Summary = {
        "title": "Theme repository checks",
        "summary": `Running tests for [${owner}/${repo}](https://github.com/${owner}/${repo})`
    }

    Summary.summary += StatusIconDescription

    const { data: CheckRun } = await context.github.checks.create(
        context.issue({
            head_sha: PRSHA,
            status: "in_progress",
            name: "Theme repository checks",
            output: Summary,
            details_url: "https://hacs.xyz/docs/publish/start"
        }))

    try {
        await context.github.repos.get({owner: owner, repo: repo})
        Summary.summary += `\n\n${StatusSuccess}  Repository exist`;

    } catch(error) {
        Summary.summary += `\n\n${StatusFailed}  Repository does not exist`;
        conclusion = "failure"
        await context.github.checks.update(
            context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary, conclusion: conclusion}))
        return
    }

    // Check if the themes directory exsist in the reopsitory
    try {
        await context.github.repos.getContents({owner: owner, repo: repo, path: "themes"});
        Summary.summary += `\n${StatusSuccess}  'themes' directory exist in the repository.`;
    } catch(error) {
        Summary.summary += `\n${StatusFailed}  ['themes' directory does not exist in the repository.]`
        Summary.summary += "(https://hacs.xyz/docs/publish/theme#repository-structure)";
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Final CheckRun update
    await context.github.checks.update(
        context.issue({
            head_sha: PRSHA,
            check_run_id: CheckRun.id,
            output: Summary,
            conclusion: conclusion
        }))
};