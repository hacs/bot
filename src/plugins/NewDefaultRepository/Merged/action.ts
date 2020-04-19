import { Context } from "probot";

import { extractOrgRepo } from "../../../util/extractOrgRepo";
import { senderIsBot } from "../../../util/filter";
import { postToDiscord } from "./postToDiscord";
import { postToPullRequest } from "./postToPullRequest";

import { categories } from "../plugin";

export async function runMergedActions(context: Context) {
  if (extractOrgRepo(context).repo !== "default" || senderIsBot(context))
    return;
  const { data: pull } = await context.github.pulls.get(context.issue());
  const titleElements = pull.title.split(" ");
  const owner_repo = titleElements[3].replace("[", "").replace("]", "");
  const category = titleElements[2].toLowerCase();

  if (!categories.includes(category)) {
    context.log(`${category} not in ${categories}`);
    return;
  }

  if (!pull.merged) {
    context.log("Did not merge");
    return;
  }

  const { data: repoAdded } = await context.github.repos.get({
    owner: owner_repo.split("/")[0],
    repo: owner_repo.split("/")[1],
  });

  await postToDiscord(repoAdded, category);
  await postToPullRequest(context, category);
}
