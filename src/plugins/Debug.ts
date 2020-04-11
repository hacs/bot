import { Application, Context } from "probot";
import { extractLabels } from "../util/extractLabels";
import { extractOrgRepo } from "../util/extractOrgRepo";
import { extractTasks } from "../util/extractTasks";

export const NAME = "Debug";

export const initDebug = (app: Application) => {
  app.on("*", async (context) => {
    runDebug(context);
  });
};

export function runDebug(context: Context) {
  context.log(NAME, context.payload);
  context.log(NAME, extractLabels(context));
  context.log(NAME, extractOrgRepo(context));
  context.log(NAME, extractTasks(context));
}
