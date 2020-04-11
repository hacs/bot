import { Application, Context } from "probot";

export const NAME = "Debug";

export const initDebug = (app: Application) => {
  app.on("*", async (context) => {
    runDebug(context);
  });
};

export function runDebug(context: Context) {
  context.log(NAME, context.payload);
}
