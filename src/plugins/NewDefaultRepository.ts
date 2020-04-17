import { Application, Context } from "probot";
import { Base64 } from "js-base64";
import { CommonCheck } from "./NewDefaultRepository/OpenedActions/checks/CommonCheck";
import { IntegrationCheck } from "./NewDefaultRepository/OpenedActions/checks/IntegrationCheck";
import { PluginCheck } from "./NewDefaultRepository/OpenedActions/checks/PluginCheck";
import { ThemeCheck } from "./NewDefaultRepository/OpenedActions/checks/ThemeCheck";
import { AppdaemonCheck } from "./NewDefaultRepository/OpenedActions/checks/AppdaemonCheck";
import { NetdaemonCheck } from "./NewDefaultRepository/OpenedActions/checks/NetdaemonCheck";
import { PythonScriptCheck } from "./NewDefaultRepository/OpenedActions/checks/PythonScriptCheck";
import { extractOrgRepo } from "../util/extractOrgRepo";
import { extractTasks } from "../util/extractTasks";
import { senderIsBot } from "../filter";

export const NAME = "NewDefaultRepository";

export const NewDefaultRepository = (app: Application) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.edited",
      "pull_request.reopened",
      "pull_request.labeled",
      "pull_request.synchronize",
      "check_run.rerequested",
    ],
    async (context) => {
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
  );
};

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

  const { data: ChangedContents } = await context.github.repos.getContents(
    context.issue({ path: file, ref: PullRef })
  );

  var ChangedDecoded: string[] = JSON.parse(
    Base64.decode((ChangedContents as any)["content"])
  );

  const { data: Contents } = await context.github.repos.getContents(
    context.issue({ path: file })
  );

  var Decoded: string[] = JSON.parse(
    Base64.decode((Contents as any)["content"])
  );

  var NewItems: string[] = [];

  ChangedDecoded.forEach((element) => {
    if (!Decoded.includes(element)) NewItems.push(element);
  });

  context.log("NewItems: ", NewItems);

  return NewItems;
}
