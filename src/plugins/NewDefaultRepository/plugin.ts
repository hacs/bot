import { Application, Context } from "probot";

import { extractOrgRepo } from "../../util/extractOrgRepo";
import { postNewRepoOnDiscord } from "./MergedActions/postNewRepoOnDiscord";

export const NAME = "NewDefaultRepository";

export const initNewDefaultRepository = (app: Application) => {
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
      await runNewDefaultRepositoryOpened(context);
    }
  );
  app.on("pull_request.closed", async (context) => {
    await runNewDefaultRepositoryMerged(context);
  });
};

async function runNewDefaultRepositoryOpened(context: Context) {}

async function runNewDefaultRepositoryMerged(context: Context) {
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

  await postNewRepoOnDiscord(repoAdded, category);
}
