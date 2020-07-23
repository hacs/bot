import { Context } from "probot";
import { contextData } from "../../../util/context";

import { senderIsBot } from "../../../util/filter";
import { extractOrgRepo } from "../../../util/extractOrgRepo";

export const NAME = "NewDefaultRepositoryOpened";

export async function runOpenedActions(context: Context) {
  if (senderIsBot(context)) return;
  if (extractOrgRepo(context).repo !== "default") return;

  context.log(NAME, "Is bot?", senderIsBot(context));

  const contextdata = new contextData(context.issue());

  const CurrentLabels = await context.github.issues.listLabelsOnIssue(
    contextdata.issue
  );
  CurrentLabels.data.forEach(async (element) => {
    if (element.name === "Not finished") {
      await context.github.issues.removeLabel({
        ...contextdata.issue,
        ...{ name: "Not finished" },
      });
    }
  });
  let changedFiles = await getChangedFiles(context);
  changedFiles = changedFiles.filter((filen: string) => {
    if (filen === "blacklist") return false;
    return true;
  });
  context.log("changedFiles: ", changedFiles);

  if (changedFiles.length > 1) {
    return;
  }

  let repoCategory = changedFiles.pop();
  const ChangedRepos = await getFileDiff(context, repoCategory || "");

  context.log("ChangedRepos: ", ChangedRepos);

  const newRepo = ChangedRepos.pop();
  if (newRepo === undefined) return;

  const owner = newRepo.split("/")[0];
  const repo = newRepo.split("/")[1];

  await context.github.issues.addLabels(
    context.issue({ labels: ["New default repository"] })
  );

  if (repoCategory) {
    if (
      context.payload.pull_request?.title !==
      `Adds new ${repoCategory} [${owner}/${repo}]`
    ) {
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
    }
  }
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
    Buffer.from((ChangedContents as any).content, "base64").toString()
  );

  const { data: Contents } = await context.github.repos.getContents(
    context.issue({ path: file })
  );

  var Decoded: string[] = JSON.parse(
    Buffer.from((Contents as any).content, "base64").toString()
  );

  var NewItems: string[] = [];

  ChangedDecoded.forEach((element) => {
    if (!Decoded.includes(element)) NewItems.push(element);
  });

  context.log(NAME, NewItems);

  return NewItems;
}
