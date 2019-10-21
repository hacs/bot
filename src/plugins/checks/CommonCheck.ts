import { Context } from 'probot'
import { StatusIconDescription, StatusFailed, StatusNeutral, StatusSuccess } from './StatusIconDescription'

export async function CommonCheck(context: Context, owner: string, repo: string) {
    const {data: PR} = await context.github.pullRequests.get(context.issue())
    const PRAuthor = PR.user.login
    const PRSHA = PR.head.sha
    var conclusion: "success" | "failure" | "neutral" = "success"
    let Summary = {
        "title": "Common repository checks",
        "summary": `Running tests for [${owner}/${repo}](https://github.com/${owner}/${repo})`
    }

    Summary.summary += StatusIconDescription

    const { data: CheckRun } = await context.github.checks.create(
        context.issue({
            head_sha: PRSHA,
            status: "in_progress",
            name: "Common repository checks",
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

    const { data: Repository } = await context.github.repos.get({owner: owner, repo: repo})

    // Check if the reopsitory is a fork
    if (!Repository.fork) {
        Summary.summary += `\n${StatusSuccess}  Repository is not a fork`;
    } else {
        Summary.summary += `\n${StatusNeutral}  Repository is a fork`;
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------

    // Check if the author of the PR is the owner of the repo
    if (PRAuthor === owner) {
        Summary.summary += `\n${StatusSuccess}  ${PRAuthor} is the owner of ${owner}/${repo}`;
    } else {
        Summary.summary += `\n${StatusNeutral}  [${PRAuthor} is not the owner of ${owner}/${repo}](https://hacs.xyz/docs/publish/include)`;
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Check if the reopsitory is archived
    if (!Repository.archived) {
        Summary.summary += `\n${StatusSuccess}  Repository is not archived`;
    } else {
        Summary.summary += `\n${StatusFailed}  Repository is archived`;
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Check if the reopsitory has a description
    if (Repository.description !== null) {
        Summary.summary += `\n${StatusSuccess}  Repository has a description`;
    } else {
        Summary.summary += `\n${StatusFailed}  [Repository does not have a description](https://hacs.xyz/docs/publish/start#description)`;
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Check if the reopsitory has a README file
    try {
        var ReadmeExist = false;
        var { data: BaseFiles } = await context.github.repos.getContents(
            {owner: owner, repo: repo, path: ""});

        (BaseFiles as [any]).forEach(element => {
            if (String(element.name).toLowerCase() === "readme") ReadmeExist = true;
            if (String(element.name).toLowerCase() === "readme.md") ReadmeExist = true;
        });

        if (!ReadmeExist) throw "README does not exist";
        Summary.summary += `\n${StatusSuccess}  README file exist in the repository.`;
    } catch(error) {
        Summary.summary += `\n${StatusFailed}  [README file does not exist in the repository.]`
        Summary.summary += "(https://hacs.xyz/docs/publish/start#readme)";
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Check if the reopsitory has a hacs.json file
    try {
        var { data: hacsManifest } = await context.github.repos.getContents(
            {owner: owner, repo: repo, path: "hacs.json"});

        var hacsManifestDecoded = JSON.parse(Base64.decode(hacsManifest.content));

        if (!hacsManifestDecoded.name) throw "Data not correct";

        Summary.summary += `\n${StatusSuccess}  hacs.json file exist in the repository.`;
    } catch(error) {
        Summary.summary += `\n${StatusFailed}  [hacs.json file does not exist in the repository, or is not correctly formated]`
        Summary.summary += "(https://hacs.xyz/docs/publish/start#hacsjson)";
        conclusion = "failure"
    }

    await context.github.checks.update(
        context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
    // --------------------------------------------------------------------------------


    // Check if the reopsitory has a INFO file
    if (hacsManifestDecoded !== undefined) {
        if (!hacsManifestDecoded.render_readme) {
            try {
                var InfoExist = false;
                var { data: BaseFiles } = await context.github.repos.getContents(
                    {owner: owner, repo: repo, path: ""});
        
                (BaseFiles as [any]).forEach(element => {
                    if (String(element.name).toLowerCase() === "info") InfoExist = true;
                    if (String(element.name).toLowerCase() === "info.md") InfoExist = true;
                });
        
                if (!InfoExist) throw "INFO does not exist";
                Summary.summary += `\n${StatusSuccess}  INFO file exist in the repository.`;
            } catch(error) {
                Summary.summary += `\n${StatusFailed}  [INFO file does not exist in the repository.]`
                Summary.summary += "(https://hacs.xyz/docs/publish/start#infomd)";
                conclusion = "failure"
            }
        
            await context.github.checks.update(
                context.issue({head_sha: PRSHA, check_run_id: CheckRun.id, output: Summary}))
        }
    }
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