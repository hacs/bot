import { Application, Context } from "probot";
import { ExecutionFilter } from "./ExecutionFilter";

const isHacktoberfestLive = () => new Date().getMonth() == 9;

const HacktoberFestMessage: string = `
## It's Hacktoberfest 🎉

Make sure that you have signed up at https://hacktoberfest.digitalocean.com/
`;

export const Hacktoberfest = (app: Application) => {
  if (!isHacktoberfestLive) return;
  app.on("pull_request.opened", async context => {
    if (!ExecutionFilter(context)) return;
    await OpenAction(context);
  });
  app.on("pull_request.closed", async context => {
    if (!ExecutionFilter(context)) return;
    await CloseAction(context);
  });
};

async function OpenAction(context: Context) {
  await context.github.issues.createComment(
    context.issue({ body: HacktoberFestMessage })
  );

  await CreateOrUpdateHacktoberfestLabel(context);

  await context.github.issues.addLabels(
    context.issue({ labels: ["Hacktoberfest"] })
  );
}

async function CloseAction(context: Context) {
  const PRStatus = await context.github.pullRequests.get(context.issue());
  if (PRStatus.data.merged) return;

  await context.github.issues.removeLabel(
    context.issue({ name: "Hacktoberfest" })
  );

  await context.github.issues.addLabels(context.issue({ labels: ["invalid"] }));
}

async function CreateOrUpdateHacktoberfestLabel(context: Context) {
  var LabelExists: boolean = false;
  const CurrentLabels = await context.github.issues.listLabelsForRepo(
    context.issue()
  );

  CurrentLabels.data.forEach(element => {
    if (element.name.toLocaleLowerCase() === "hacktoberfest")
      LabelExists = true;
  });

  if (LabelExists) {
    await context.github.issues.updateLabel(
      context.issue({
        current_name: "hacktoberfest",
        name: "Hacktoberfest",
        color: "ff5500"
      })
    );
  } else {
    await context.github.issues.createLabel(
      context.issue({ name: "Hacktoberfest", color: "ff5500" })
    );
  }
}
