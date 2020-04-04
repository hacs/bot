import { Context } from "probot";
import { StatusIconDescription } from "./StatusIconDescription";

export async function PluginCheck(
  context: Context,
  owner: string,
  repo: string
) {
  const { data: PR } = await context.github.pullRequests.get(context.issue());
  const PRSHA = PR.head.sha;
  var conclusion: "success" | "failure" | "neutral" = "success";
  let Summary = {
    title: "HACS Category checks",
    summary: `Running tests for [${owner}/${repo}](https://github.com/${owner}/${repo})`
  };

  Summary.summary += StatusIconDescription;

  const { data: CheckRun } = await context.github.checks.create(
    context.issue({
      head_sha: PRSHA,
      status: "in_progress",
      name: "HACS Category checks",
      output: Summary,
      details_url: "https://hacs.xyz/docs/publish/start"
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
        conclusion: conclusion
      })
    );
    return;
  }

  // Check if the plugin files exsis.
  try {
    var pluginExist = false;
    if (!pluginExist) pluginExist = await CheckDist(owner, repo, context);
    if (!pluginExist) pluginExist = await CheckRelease(owner, repo, context);
    if (!pluginExist) pluginExist = await CheckRoot(owner, repo, context);

    if (!pluginExist) throw "error";
    Summary.summary += "\n✅  Plugin exist";
  } catch (error) {
    Summary.summary +=
      "\n❌  [The location of the plugin is in one of the expected locations]";
    Summary.summary +=
      "(https://hacs.xyz/docs/publish/plugin#repository-structure)";
    conclusion = "failure";
  }

  await context.github.checks.update(
    context.issue({
      head_sha: PRSHA,
      check_run_id: CheckRun.id,
      output: Summary
    })
  );
  // --------------------------------------------------------------------------------

  // Final CheckRun update
  await context.github.checks.update(
    context.issue({
      head_sha: PRSHA,
      check_run_id: CheckRun.id,
      output: Summary,
      conclusion: conclusion
    })
  );
}

async function CheckDist(owner: string, repo: string, context: Context) {
  var pluginExist = false;
  const valid_names = [
    `${repo.replace("lovelace-", "")}.js`,
    `${repo}.js`,
    `${repo}.umd.js`,
    `${repo}-bundle.js`
  ];
  try {
    var DistContents = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "dist"
    });

    (DistContents.data as [any]).forEach(element => {
      if (valid_names.includes(element.name)) pluginExist = true;
    });
    if (pluginExist) return true;
  } catch (error) {
    context.log(error);
  }
  return false;
}

async function CheckRelease(owner: string, repo: string, context: Context) {
  var pluginExist = false;
  const valid_names = [
    `${repo.replace("lovelace-", "")}.js`,
    `${repo}.js`,
    `${repo}.umd.js`,
    `${repo}-bundle.js`
  ];
  try {
    var ReleaseContents = await context.github.repos.getLatestRelease({
      owner: owner,
      repo: repo
    });

    (ReleaseContents.data.assets as [any]).forEach(element => {
      if (valid_names.includes(element.name)) pluginExist = true;
    });
    if (pluginExist) return true;
  } catch (error) {
    context.log(error);
  }
  return false;
}

async function CheckRoot(owner: string, repo: string, context: Context) {
  var pluginExist = false;
  const valid_names = [
    `${repo.replace("lovelace-", "")}.js`,
    `${repo}.js`,
    `${repo}.umd.js`,
    `${repo}-bundle.js`
  ];
  try {
    var RootContents = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: ""
    });

    (RootContents.data as [any]).forEach(element => {
      if (valid_names.includes(element.name)) pluginExist = true;
    });
    if (pluginExist) return true;
  } catch (error) {
    context.log(error);
  }
  return false;
}
