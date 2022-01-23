import { App } from "octokit";
import { HACS, HacsRepositories } from "../const";
import { PullPayload } from "../types";

import { extractOrgRepo } from "../utils/extractOrgRepo";
import { senderIsBot } from "../utils/filter";

export default async (app: App, payload: PullPayload): Promise<void> => {
  if (senderIsBot(payload) || extractOrgRepo(payload).repo !== HacsRepositories.DEFAULT) return;

  const changedFiles = getChangedFiles(app, payload)

}



async function getChangedFiles(app: App, payload: PullPayload): Promise<string[]> {
  const listFilesResponse = await app.octokit.rest.pulls.listFiles(
    {owner: HACS, repo: HacsRepositories.DEFAULT, pull_number: payload.pull_request.number}
  );
  return listFilesResponse.data.map((f) => f.filename);
}