import { Application } from "probot";

import { runMergedActions } from "./Merged/action";
import { runOpenedActions } from "./Opened/action";

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
      await runOpenedActions(context);
    }
  );
  app.on("pull_request.closed", async (context) => {
    await runMergedActions(context);
  });
};
