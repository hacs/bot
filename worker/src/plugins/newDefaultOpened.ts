import { App } from "octokit";
import { RepositoryName } from "../const";
import { PullPayload } from "../types";

import { extractOwnerRepo } from "../utils/extractOwnerRepo";
import { senderIsBot } from "../utils/filter";

export default async (app: App, payload: PullPayload): Promise<void> => {
  if (senderIsBot(payload) || extractOwnerRepo(payload).repo !== RepositoryName.DEFAULT || !["opened"].includes(payload.action)) return;

  const changedFiles = getChangedFiles(app, payload)

}



async function getChangedFiles(app: App, payload: PullPayload): Promise<string[]> {
  const listFilesResponse = await app.octokit.rest.pulls.listFiles(
    {...extractOwnerRepo(payload), pull_number: payload.pull_request.number}
  );
  return listFilesResponse.data.map((f) => f.filename);
}