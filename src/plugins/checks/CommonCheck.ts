import { Context } from "probot";
import {
  StatusFailed,
  StatusNeutral,
  StatusSuccess,
  Check,
  updateCheck,
  createCheck,
} from "./Status";
import { strict } from "assert";

const TITLE = "Common repository checks";
const NAME = "CommonCheck";

export async function CommonCheck(
  context: Context,
  owner: string,
  repo: string
) {
  const { data: PR } = await context.github.pulls.get(context.issue());
  const PRAuthor = PR.user.login;
  const PRSHA = PR.head.sha;

  const checks: Check[] = [];

  const { data: CheckRun } = await createCheck(context, PRSHA, TITLE);

  // Check if the repository exsist
  try {
    await context.github.repos.get({ owner: owner, repo: repo });
    checks.push({ description: "Repository exist", success: true });
  } catch (error) {
    checks.push({ description: "Repository does not exist", success: false });
    updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, "failure");
    return;
  }

  const { data: Repository } = await context.github.repos.get({
    owner: owner,
    repo: repo,
  });

  // Check if the repository is a fork
  checks.push({
    description: "Repository is not a fork",
    success: !Repository.fork,
    canFail: true,
  });

  updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the author of the PR is the owner of the repo
  checks.push({
    description: `${PRAuthor} is the owner of ${owner}/${repo}`,
    success: PRAuthor === owner,
    canFail: true,
    link: "https://hacs.xyz/docs/publish/include",
  });

  updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository is archived
  checks.push({
    description: "Repository is not archived",
    success: !Repository.archived,
  });

  updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a description
  checks.push({
    description: "Repository has a description",
    success: Repository.description !== null,
    link: "https://hacs.xyz/docs/publish/start#description",
  });

  updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a README file
  let ReadmeExist: boolean;
  try {
    var { data: BaseFiles } = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "",
    });

    ReadmeExist =
      (BaseFiles as [any])
        .map((file) => file.name)
        .filter((file) => {
          return file.toLowerCase().includes("readme");
        }).length === 1;

    if (!ReadmeExist) throw "README does not exist";
  } catch (error) {
    ReadmeExist = false;
  }

  checks.push({
    description: "README file exist in the repository",
    success: ReadmeExist,
    link: "https://hacs.xyz/docs/publish/start#readme",
  });

  updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a hacs.json file
  try {
    var { data: hacsManifest } = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "hacs.json",
    });

    var hacsManifestDecoded = JSON.parse(
      Base64.decode((hacsManifest as any).content)
    );

    if (!hacsManifestDecoded.name) throw "Data not correct";

    Summary.summary += `\n${StatusSuccess}  hacs.json file exist in the repository.`;
  } catch (error) {
    Summary.summary += `\n${StatusFailed}  [hacs.json file does not exist in the repository, or is not correctly formated]`;
    Summary.summary += "(https://hacs.xyz/docs/publish/start#hacsjson)";
    conclusion = "failure";
  }

  updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a INFO file
  if (hacsManifestDecoded !== undefined) {
    if (!hacsManifestDecoded.render_readme) {
      try {
        var InfoExist = false;
        var { data: BaseFiles } = await context.github.repos.getContents({
          owner: owner,
          repo: repo,
          path: "",
        });

        (BaseFiles as [any]).forEach((element) => {
          if (String(element.name).toLowerCase() === "info") InfoExist = true;
          if (String(element.name).toLowerCase() === "info.md")
            InfoExist = true;
        });

        if (!InfoExist) throw "INFO does not exist";
        Summary.summary += `\n${StatusSuccess}  INFO file exist in the repository.`;
      } catch (error) {
        Summary.summary += `\n${StatusFailed}  [INFO file does not exist in the repository.]`;
        Summary.summary += "(https://hacs.xyz/docs/publish/start#infomd)";
      }

      updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
    }
  }
  // --------------------------------------------------------------------------------

  // Final CheckRun update
  updateCheck(
    context,
    PRSHA,
    CheckRun.id,
    TITLE,
    checks,
    checks.filter((check) => {
      return !check.success;
    }).length === 0
      ? "success"
      : "failure"
  );
}
