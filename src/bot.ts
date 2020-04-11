import { Application } from "probot";
import { initDebug } from "./plugins/Debug";
import { initGreeter } from "./plugins/Greeter";
import { initHacktoberfest } from "./plugins/Hacktoberfest";
import { ClearTempLabels } from "./plugins/ClearTempLabels";
import { NewDefaultRepository } from "./plugins/NewDefaultRepository";
import { NewDefaultRepositoryMerged } from "./plugins/NewDefaultRepositoryMerged";
import { ClosedIssue } from "./plugins/ClosedIssue";
import { ReleaseHelper } from "./plugins/ReleaseHelper";

export = (app: Application) => {
  initDebug(app);
  initGreeter(app);
  initHacktoberfest(app);

  NewDefaultRepository(app);

  ClosedIssue(app);
  ClearTempLabels(app);
  NewDefaultRepositoryMerged(app);
  ReleaseHelper(app);
};
