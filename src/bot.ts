import { Application } from "probot";

import { initDebug } from "./plugins/Debug/plugin";
import { initKnownIssues } from "./plugins/KnownIssues/plugin";
import { initGreeter } from "./plugins/Greeter/plugin";
import { initCommands } from "./plugins/Commands/plugin";
import { initHacktoberfest } from "./plugins/Hacktoberfest/plugin";
import { initClearTempLabels } from "./plugins/ClearTempLabels/plugin";
import { initNewDefaultRepository } from "./plugins/NewDefaultRepository/plugin";
import { initReleaseHelper } from "./plugins/ReleaseHelper/plugin";

export = (app: Application) => {
  initDebug(app);
  initKnownIssues(app);
  initGreeter(app);
  //initHacktoberfest(app);
  initCommands(app);
  initClearTempLabels(app);
  initNewDefaultRepository(app);
  initReleaseHelper(app);
};
