import { Context } from "probot";

import { extractOrgRepo } from "../../../util/extractOrgRepo";
import { postToDiscord } from "./postToDiscord";

export async function runMergedActions(context: Context) {
  if (extractOrgRepo(context).repo !== "default") return;
  const { data: pull } = await context.github.pulls.get(context.issue());
  const titleElements = pull.title.split(" ");
  const owner_repo = titleElements[3].replace("[", "").replace("]", "");
  const category = titleElements[2];

  if (!pull.merged) {
    context.log("Did not merge");
    return;
  }

  const { data: repoAdded } = await context.github.repos.get({
    owner: owner_repo.split("/")[0],
    repo: owner_repo.split("/")[1],
  });

  await postToDiscord(repoAdded, category);
}
