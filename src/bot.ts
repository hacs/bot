import { Application } from "probot";

import { initDebug } from "./plugins/Debug/plugin";
import { initKnownIssues } from "./plugins/KnownIssues/plugin";
import { initGreeter } from "./plugins/Greeter/plugin";
import { initCommands } from "./plugins/Commands/plugin";
import { initClearTempLabels } from "./plugins/ClearTempLabels/plugin";
import { initNewDefaultRepository } from "./plugins/NewDefaultRepository/plugin";
import { initReleaseHelper } from "./plugins/ReleaseHelper/plugin";
import { initBlankIssues } from "./plugins/BlankIssues/plugin";

export = (app: Application) => {
  initDebug(app);
  initBlankIssues(app);
  initKnownIssues(app);
  initGreeter(app);
  initCommands(app);
  initClearTempLabels(app);
  initNewDefaultRepository(app);
  initReleaseHelper(app);
};
