import { Context } from "probot";
import { StatusIconDescription } from "./Status";

export async function IntegrationCheck(
  context: Context,
  owner: string,
  repo: string
) {
  const { data: PR } = await context.github.pulls.get(context.issue());
  const PRSHA = PR.head.sha;
  var conclusion: "success" | "failure" | "neutral" = "success";
  let Summary = {
    title: "HACS Category checks",
    summary: `Running tests for [${owner}/${repo}](https://github.com/${owner}/${repo})`,
  };

  Summary.summary += StatusIconDescription;

  const { data: CheckRun } = await context.github.checks.create(
    context.issue({
      head_sha: PRSHA,
      status: "in_progress",
      name: "HACS Category checks",
      output: Summary,
      details_url: "https://hacs.xyz/docs/publish/start",
    })
  );

  try {
    await context.github.repos.get({ owner: owner, repo: repo });
    Summary.summary += "\n\n✅  Repository exist";
  } catch (error) {
    Summary.summary += "\n\n❌  Repository does not exist";
    conclusion = "failure";
    await context.github.checks.update(
      context.issue({
        head_sha: PRSHA,
        check_run_id: CheckRun.id,
        output: Summary,
        conclusion: conclusion,
      })
    );
    return;
  }

  // Check if the custom_components directory exist in the repository
  try {
    var Integration = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "custom_components",
    });
    Summary.summary +=
      "\n✅  'custom_components' directory exist in the repository.";
  } catch (error) {
    Summary.summary +=
      "\n❌  ['custom_components' directory does not exist in the repository.]";
    Summary.summary +=
      "(https://hacs.xyz/docs/publish/integration#repository-structure)";
    conclusion = "failure";
  }

  await context.github.checks.update(
    context.issue({
      head_sha: PRSHA,
      check_run_id: CheckRun.id,
      output: Summary,
    })
  );
  // --------------------------------------------------------------------------------

  // Check if the integration manifest exist in the repository
  let manifest: any;
  try {
    var Integration = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "custom_components",
    });
    var IntegrationManifest = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: (Integration as any).data[0].path + "/manifest.json",
    });

    manifest = JSON.parse(
      Base64.decode((IntegrationManifest as any).data["content"])
    );
    if (!manifest["domain"]) throw "wrong manifest content";

    Summary.summary += "\n✅  Integration manifest exist";
  } catch (error) {
    Summary.summary +=
      "\n❌  [Integration manifest does not exist, or is not valid JSON]";
    Summary.summary +=
      "(https://hacs.xyz/docs/publish/integration#repository-structure)";
    conclusion = "failure";
  }

  if (manifest.includes("domain")) {
    Summary.summary += "\n✅  Integration manifest includes 'domain'";
  } else {
    Summary.summary += "\n❌  Integration manifest does not  includes 'domain'";
  }

  if (manifest.includes("documentation")) {
    Summary.summary += "\n✅  Integration manifest includes 'documentation'";
  } else {
    Summary.summary +=
      "\n❌  Integration manifest does not  includes 'documentation'";
  }

  await context.github.checks.update(
    context.issue({
      head_sha: PRSHA,
      check_run_id: CheckRun.id,
      output: Summary,
    })
  );
  // --------------------------------------------------------------------------------

  // Final CheckRun update
  await context.github.checks.update(
    context.issue({
      head_sha: PRSHA,
      check_run_id: CheckRun.id,
      output: Summary,
      conclusion: conclusion,
    })
  );
}
