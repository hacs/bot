import { Application, Context } from "probot";
import { senderIsBot } from "../../util/filter";

export const NAME = "Hacktoberfest";
export const LABEL_INVALID = "invalid";

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
  await context.github.issues.createComment(
    context.issue({ body: HacktoberFestMessage })
  );

  await CreateOrUpdateHacktoberfestLabel(context);

  await context.github.issues.addLabels(
    context.issue({ labels: ["Hacktoberfest"] })
  );
}

export async function closeAction(context: Context) {
  if (!isHacktoberfestLive) return;
  if (senderIsBot(context)) return;
  const PRStatus = await context.github.pulls.get(context.issue());
  if (PRStatus.data.merged) return;

  await context.github.issues.removeLabel(
    context.issue({ name: "Hacktoberfest" })
  );

  await context.github.issues.addLabels(
    context.issue({ labels: [LABEL_INVALID] })
  );
}

async function CreateOrUpdateHacktoberfestLabel(context: Context) {
  var LabelExists: boolean = false;
  const CurrentLabels = await context.github.issues.listLabelsForRepo(
    context.issue()
  );

  CurrentLabels.data.forEach((element) => {
    if (element.name.toLocaleLowerCase() === "hacktoberfest")
      LabelExists = true;
  });

  if (LabelExists) {
    await context.github.issues.updateLabel(
      context.issue({
        current_name: "hacktoberfest",
        name: "Hacktoberfest",
        color: "ff5500",
      })
    );
  } else {
    await context.github.issues.createLabel(
      context.issue({ name: "Hacktoberfest", color: "ff5500" })
    );
  }
}
