import { Context } from "probot";
import { StatusIconDescription } from "./StatusIconDescription";

export async function AppdaemonCheck(
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

  // Check if the apps directory exist in the repository
  try {
    await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "apps",
    });
    Summary.summary += "\n✅  'apps' directory exist in the repository.";
  } catch (error) {
    Summary.summary +=
      "\n❌  ['apps' directory does not exist in the repository.]";
    Summary.summary +=
      "(https://hacs.xyz/docs/publish/appdaemon#repository-structure)";
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
