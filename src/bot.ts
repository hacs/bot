import { Application } from "probot";
import { Greeter } from "./plugins/Greeter";
//import { Hacktoberfest } from "./plugins/Hacktoberfest"
import { ClearTempLabels } from "./plugins/ClearTempLabels";
import { NewDefaultRepository } from "./plugins/NewDefaultRepository";
import { NewDefaultRepositoryMerged } from "./plugins/NewDefaultRepositoryMerged";
import { ClosedIssue } from "./plugins/ClosedIssue";
import { ReleaseHelper } from "./plugins/ReleaseHelper";

export = (app: Application) => {
  Greeter(app);
  //Hacktoberfest(app)

  NewDefaultRepository(app);

  ClosedIssue(app);
  ClearTempLabels(app);
  NewDefaultRepositoryMerged(app);
  ReleaseHelper(app);
};
