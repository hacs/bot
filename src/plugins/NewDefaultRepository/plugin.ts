import { Application } from "probot";

import { runMergedActions } from "./Merged/action";
import { runOpenedActions } from "./Opened/action";

export const NAME = "NewDefaultRepository";

export const categories: string[] = [
  "appdaemon",
  "integration",
  "netdaemon",
  "plugin",
  "python_script",
  "theme",
];

export const initNewDefaultRepository = (app: Application) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.edited",
      "pull_request.reopened",
      "pull_request.labeled",
      "pull_request.synchronize",
    ],
    async (context) => {
      await runOpenedActions(context);
    }
  );
  app.on("pull_request.closed", async (context) => {
    await runMergedActions(context);
  });
};
