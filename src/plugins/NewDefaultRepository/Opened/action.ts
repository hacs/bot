import { Context } from "probot";

import { senderIsBot } from "../../../util/filter";
import { extractOrgRepo } from "../../../util/extractOrgRepo";
import { extractTasks } from "../../../util/extractTasks";

import { CommonCheck } from "./checks/CommonCheck";
import { AppdaemonCheck } from "./checks/AppdaemonCheck";
import { IntegrationCheck } from "./checks/IntegrationCheck";
import { NetdaemonCheck } from "./checks/NetdaemonCheck";
import { PluginCheck } from "./checks/PluginCheck";
import { PythonScriptCheck } from "./checks/PythonScriptCheck";
import { ThemeCheck } from "./checks/ThemeCheck";

export const NAME = "NewDefaultRepositoryOpened";

export async function runOpenedActions(context: Context) {
  if (senderIsBot(context)) return;
  if (extractOrgRepo(context).repo !== "default") return;
  if (extractTasks(context).filter((task) => task.check).length !== 4) {
    context.log(NAME, "Missing tasks");
    await context.github.issues.addLabels(
      context.issue({ labels: ["Not finished"] })
    );
    return;
  }
  const CurrentLabels = await context.github.issues.listLabelsOnIssue(
    context.issue()
  );
  CurrentLabels.data.forEach(async (element) => {
    if (element.name === "Not finished") {
      await context.github.issues.removeLabel(
        context.issue({ name: "Not finished" })
      );
    }
  });
  let changedFiles = await getChangedFiles(context);
  changedFiles = changedFiles.filter((filen: string) => {
    if (filen === "blacklist") return false;
    return true;
  });
  context.log("changedFiles: ", changedFiles);

  if (changedFiles.length > 1) {
    await context.github.issues.createComment(
      context.issue({
        body: "Only a single file change is allowed.",
      })
    );
    return;
  }

  let repoCategory = changedFiles.pop();
  const ChangedRepos = await getFileDiff(context, repoCategory || "");

  if (ChangedRepos.length > 1) {
    await context.github.issues.createComment(
      context.issue({
        body: "Only a single repository change is allowed.",
      })
    );
    return;
  } else if (ChangedRepos.length !== 1) {
    await context.github.issues.createComment(
      context.issue({
        body: "Could not determine the change, try to rebase your branch.",
      })
    );
    return;
  }
  context.log("ChangedRepos: ", ChangedRepos);

  const newRepo = ChangedRepos.pop();
  if (newRepo === undefined) return;

  const owner = newRepo.split("/")[0];
  const repo = newRepo.split("/")[1];

  await context.github.issues.addLabels(
    context.issue({ labels: ["New default repository"] })
  );

  if (repoCategory) {
    await context.github.issues.update(
      context.issue({
        title: `Adds new ${repoCategory} [${owner}/${repo}]`,
      })
    );
    await context.github.issues.createComment(
      context.issue({
        body: `Running checks on [${owner}/${repo}](https://github.com/${owner}/${repo})`,
      })
    );
    await CommonCheck(context, owner, repo);
    await CategoryChecks(repoCategory, owner, repo, context);
  }
}

async function CategoryChecks(
  category: string,
  owner: string,
  repo: string,
  context: Context
) {
  const validCategories = [
    "integration",
    "plugin",
    "theme",
    "appdaemon",
    "netdaemon",
    "python_script",
  ];
  if (!validCategories.includes(category)) return;
  if (category == "integration") await IntegrationCheck(context, owner, repo);
  if (category == "plugin") await PluginCheck(context, owner, repo);
  if (category == "theme") await ThemeCheck(context, owner, repo);
  if (category == "appdaemon") await AppdaemonCheck(context, owner, repo);
  if (category == "netdaemon") await NetdaemonCheck(context, owner, repo);
  if (category == "python_script")
    await PythonScriptCheck(context, owner, repo);
}

async function getChangedFiles(context: Context) {
  const listFilesResponse = await context.github.pulls.listFiles(
    context.issue()
  );
  const changedFiles = listFilesResponse.data.map((f) => f.filename);
  return changedFiles;
}

async function getFileDiff(context: Context, file: string) {
  const { data: Pull } = await context.github.pulls.get(context.issue());

  const PullRef = Pull["head"]["sha"];
  context.log(NAME, PullRef);

  const { data: ChangedContents } = await context.github.repos.getContents(
    context.issue({ path: file, ref: PullRef })
  );
  context.log(NAME, ChangedContents);

  var ChangedDecoded: string[] = JSON.parse(
    Buffer.from((ChangedContents as any).content, "base64").toString()
  );
  context.log(NAME, ChangedDecoded);

  const { data: Contents } = await context.github.repos.getContents(
    context.issue({ path: file })
  );
  context.log(NAME, Contents);

  var Decoded: string[] = JSON.parse(
    Buffer.from((Contents as any).content, "base64").toString()
  );
  context.log(NAME, Decoded);

  var NewItems: string[] = [];

  ChangedDecoded.forEach((element) => {
    context.log(NAME, element);
    if (!Decoded.includes(element)) NewItems.push(element);
  });

  context.log("NewItems: ", NewItems);

  return NewItems;
}
