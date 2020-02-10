import { Application, Context } from "probot";
import { Base64 } from "js-base64";
import { CommonCheck } from "./checks/CommonCheck";
import { IntegrationCheck } from "./checks/IntegrationCheck";
import { PluginCheck } from "./checks/PluginCheck";
import { ThemeCheck } from "./checks/ThemeCheck";
import { AppdaemonCheck } from "./checks/AppdaemonCheck";
import { PythonScriptCheck } from "./checks/PythonScriptCheck";
import { ExecutionFilter } from "./ExecutionFilter";

export const NewDefaultRepository = (app: Application) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.reopened",
      "pull_request.labeled",
      "pull_request.synchronize",
      "check_run.rerequested"
    ],
    async context => {
      if (!ExecutionFilter(context)) return;
      if (context.repo().owner !== "hacs" && context.repo().owner !== "default")
        return;

      const changedFiles = await getChangedFiles(context);
      const newRepo: string[] = [];
      let repoCategory: string | undefined = undefined;

      changedFiles.forEach(async category => {
        if (category !== "blacklist") {
          repoCategory = category;
          const repo = await getFileDiff(context, category);
          newRepo.concat(repo);
        }
      });

      if (newRepo.length === 0) {
        await context.github.issues.createComment(
          context.issue({
            body: "Could not determine the change, try to rebase your branch."
          })
        );
      } else if (newRepo.length > 1) {
        await context.github.issues.createComment(
          context.issue({
            body: "Only a single repository change is allowed."
          })
        );
      } else {
        const owner = newRepo[0].split("/")[0];
        const repo = newRepo[0].split("/")[1];

        await context.github.issues.addLabels(
          context.issue({ labels: ["New default repository"] })
        );

        if (repoCategory) {
          await context.github.issues.update(
            context.issue({
              title: `Adds new ${repoCategory} [${owner}/${repo}]`
            })
          );
          await context.github.issues.createComment(
            context.issue({
              body: `Running checks on [${owner}/${repo}](https://github.com/${owner}/${repo})`
            })
          );
          await CommonCheck(context, owner, repo);
          await CategoryChecks(repoCategory, owner, repo, context);
        }
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
    "python_script"
  ];
  if (!validCategories.includes(category)) return;
  if (category == "integration") await IntegrationCheck(context, owner, repo);
  if (category == "plugin") await PluginCheck(context, owner, repo);
  if (category == "theme") await ThemeCheck(context, owner, repo);
  if (category == "appdaemon") await AppdaemonCheck(context, owner, repo);
  if (category == "python_script")
    await PythonScriptCheck(context, owner, repo);
}

async function getChangedFiles(context: Context) {
  const listFilesResponse = await context.github.pullRequests.listFiles(
    context.issue()
  );
  const changedFiles = listFilesResponse.data.map(f => f.filename);
  return changedFiles;
}

async function getFileDiff(context: Context, file: string) {
  const { data: Pull } = await context.github.pullRequests.get(context.issue());

  const PullRef = Pull["head"]["sha"];

  const { data: ChangedContents } = await context.github.repos.getContents(
    context.issue({ path: file, ref: PullRef })
  );

  var ChangedDecoded: string[] = JSON.parse(
    Base64.decode(ChangedContents["content"])
  );

  const { data: Contents } = await context.github.repos.getContents(
    context.issue({ path: file })
  );

  var Decoded: string[] = JSON.parse(Base64.decode(Contents["content"]));

  var NewItems: string[] = [];

  ChangedDecoded.forEach(element => {
    if (!Decoded.includes(element)) NewItems.push(element);
  });

  return NewItems;
}
