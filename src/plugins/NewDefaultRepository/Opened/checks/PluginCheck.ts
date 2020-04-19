import { Context } from "probot";
import { contextData } from "../../../../util/context";
import { Check, updateCheck, createCheck } from "./Status";

const TITLE = "HACS Category checks";

export async function PluginCheck(
  context: Context,
  owner: string,
  repo: string
) {
  const { data: PR } = await context.github.pulls.get(
    new contextData(context.issue()).pull
  );
  const PRSHA = PR.head.sha;

  const checks: Check[] = [];

  const { data: CheckRun } = await createCheck(context, PRSHA, TITLE);

  // Check if the plugin files exsis.
  let pluginExist = false;
  try {
    if (!pluginExist) pluginExist = await CheckDist(owner, repo, context);
    if (!pluginExist) pluginExist = await CheckRelease(owner, repo, context);
    if (!pluginExist) pluginExist = await CheckRoot(owner, repo, context);
  } catch (error) {
    pluginExist = false;
  }

  checks.push({
    description:
      "The location of the plugin is in one of the expected locations",
    success: pluginExist,
    link: "https://hacs.xyz/docs/publish/plugin#repository-structure",
  });

  // await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Final CheckRun update
  await updateCheck(
    context,
    PRSHA,
    CheckRun.id,
    TITLE,
    checks,
    checks.filter((check) => {
      return !check.success;
    }).length === 0
      ? "success"
      : "failure"
  );
}

async function CheckDist(owner: string, repo: string, context: Context) {
  var pluginExist = false;
  const valid_names = [
    `${repo.replace("lovelace-", "")}.js`,
    `${repo}.js`,
    `${repo}.umd.js`,
    `${repo}-bundle.js`,
  ];
  try {
    var DistContents = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "dist",
    });

    (DistContents.data as [any]).forEach((element) => {
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
    `${repo}-bundle.js`,
  ];
  try {
    var ReleaseContents = await context.github.repos.getLatestRelease({
      owner: owner,
      repo: repo,
    });

    (ReleaseContents.data.assets as [any]).forEach((element) => {
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
    `${repo}-bundle.js`,
  ];
  try {
    var RootContents = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "",
    });

    (RootContents.data as [any]).forEach((element) => {
      if (valid_names.includes(element.name)) pluginExist = true;
    });
    if (pluginExist) return true;
  } catch (error) {
    context.log(error);
  }
  return false;
}
