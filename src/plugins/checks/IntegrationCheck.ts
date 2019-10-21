import { Context } from 'probot'
import { StatusIconDescription } from './StatusIconDescription'

export async function IntegrationCheck(context: Context, owner: string, repo: string) {
    const {data: PR} = await context.github.pullRequests.get(context.issue())
    const PRSHA = PR.head.sha
    var conclusion: "success" | "failure" | "neutral" = "success"
    let Summary = {
        "title": "Integration repository checks",
        "summary": `Running tests for [${owner}/${repo}](https://github.com/${owner}/${repo})`
    }

    Summary.summary += StatusIconDescription

    const { data: CheckRun } = await context.github.checks.create(
        context.issue({
            head_sha: PRSHA,
            status: "in_progress",
            name: "Integration repository checks",
            output: Summary,
            details_url: "https://hacs.xyz/docs/publish/start"
        }))

    try {
        await context.github.repos.get({owner: owner, repo: repo})
        Summary.summary += "\n\n✅  Repository exist";

    } catch(error) {
        Summary.summary += "\n\n❌  Repository does not exist";
        conclusion = "failure"
        await context.github.checks.update(
            context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary, conclusion: conclusion}))
        return
    }

    // Check if the custom_components directory exsist in the reopsitory
    try {
        var Integration = await context.github.repos.getContents({owner: owner, repo: repo, path: "custom_components"});
        Summary.summary += "\n✅  'custom_components' directory exist in the repository.";
    } catch(error) {
        Summary.summary += "\n❌  ['custom_components' directory does not exist in the repository.]"
        Summary.summary += "(https://hacs.xyz/docs/publish/integration#repository-structure)";
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Check if the integration manifest exsist in the reopsitory
    try {
        var Integration = await context.github.repos.getContents({owner: owner, repo: repo, path: "custom_components"});
        var IntegrationManifest = await context.github.repos.getContents(
            {owner: owner, repo: repo, path: Integration.data[0].path + "/manifest.json"});

        var decoded = JSON.parse(Base64.decode(IntegrationManifest.data["content"]));
        if (!decoded["domain"]) throw "wrong manifest"

        Summary.summary += "\n✅  Integration manifest exist";
    } catch(error) {
        Summary.summary += "\n❌  [Integration manifest does not exist]"
        Summary.summary += "(https://hacs.xyz/docs/publish/integration#repository-structure)";
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