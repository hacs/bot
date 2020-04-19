import { Application, Context } from "probot";
import { senderIsAdmin, senderIsBot } from "../../util/filter";
import { extractLabels } from "../../util/extractLabels";
import { extractOrgRepo } from "../../util/extractOrgRepo";
import { extractTasks } from "../../util/extractTasks";

export const NAME = "Debug";

export const initDebug = (app: Application) => {
  app.on("*", async (context) => {
    runDebug(context);
  });
};

export function runDebug(context: Context) {
  context.log(NAME, context.payload);
  context.log(NAME, "extractLabels", extractLabels(context));
  context.log(NAME, "extractOrgRepo", extractOrgRepo(context));
  context.log(NAME, "extractTasks", extractTasks(context));
  context.log(NAME, "senderIsBot", senderIsBot(context));
  context.log(NAME, "senderIsAdmin", senderIsAdmin(context));
}
