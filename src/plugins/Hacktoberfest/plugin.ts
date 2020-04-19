import { Application, Context } from "probot";
import { contextData } from "../../util/context";
import { senderIsBot } from "../../util/filter";

export const NAME = "Hacktoberfest";
export const LABEL_INVALID = "invalid";
export const LABEL_HACKTOBERFEST = "Hacktoberfest";
export const LABEL_HACKTOBERFEST_COLOR = "ff5500";

export const HacktoberFestMessage: string = `
## It's Hacktoberfest 🎉

Make sure that you have signed up at https://hacktoberfest.digitalocean.com/
`;

const isHacktoberfestLive = new Date().toJSON().split("-")[1] === "09";

export const initHacktoberfest = (app: Application) => {
  app.on("pull_request.opened", async (context) => {
    await openAction(context);
  });
  app.on("pull_request.closed", async (context) => {
    await closeAction(context);
  });
};

export async function openAction(context: Context) {
  if (!isHacktoberfestLive) return;
  if (senderIsBot(context)) return;

  const contextdata = new contextData(context.issue());
  await context.github.issues.createComment({
    ...contextdata.issue,
    ...{ body: HacktoberFestMessage },
  });

  await CreateOrUpdateHacktoberfestLabel(context);

  await context.github.issues.addLabels({
    ...contextdata.issue,
    ...{ labels: [LABEL_HACKTOBERFEST] },
  });
}

export async function closeAction(context: Context) {
  if (!isHacktoberfestLive) return;
  if (senderIsBot(context)) return;

  const contextdata = new contextData(context.issue());
  const PRStatus = await context.github.pulls.get(contextdata.pull);
  if (PRStatus.data.merged) return;

  await context.github.issues.removeLabel({
    ...contextdata.issue,
    ...{ name: LABEL_HACKTOBERFEST },
  });

  await context.github.issues.addLabels({
    ...contextdata.issue,
    ...{ labels: [LABEL_INVALID] },
  });
}

async function CreateOrUpdateHacktoberfestLabel(context: Context) {
  var LabelExists: boolean = false;
  const contextdata = new contextData(context.issue());
  const CurrentLabels = await context.github.issues.listLabelsForRepo(
    contextdata.repo
  );

  CurrentLabels.data.forEach((element) => {
    if (element.name.toLowerCase() === LABEL_HACKTOBERFEST.toLowerCase())
      LabelExists = true;
  });

  if (LabelExists) {
    await context.github.issues.updateLabel({
      ...contextdata.issue,
      ...{
        current_name: LABEL_HACKTOBERFEST.toLowerCase(),
        name: LABEL_HACKTOBERFEST,
        color: LABEL_HACKTOBERFEST_COLOR,
      },
    });
  } else {
    await context.github.issues.createLabel({
      ...contextdata.issue,
      ...{
        name: LABEL_HACKTOBERFEST,
        color: LABEL_HACKTOBERFEST_COLOR,
      },
    });
  }
}
