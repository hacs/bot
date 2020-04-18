import { Application, Context } from "probot";

export const NAME = "Template";

export const initTemplate = (app: Application) => {
  app.on(["pull_request.opened"], async (context) => {
    await runTemplate(context);
  });
};

export async function runTemplate(context: Context) {}
