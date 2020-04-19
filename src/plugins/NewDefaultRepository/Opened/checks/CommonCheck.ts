import { Context } from "probot";
import { Check, updateCheck, createCheck } from "./Status";

const TITLE = "Common repository checks";

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
  let repositoryExsist!: boolean;
  let repository: any;
  try {
    repository = await context.github.repos.get({ owner: owner, repo: repo });
    repository = repository.data;
    repositoryExsist = true;
  } catch (error) {
    repositoryExsist = false;
  }

  checks.push({ description: "Repository exist", success: repositoryExsist });

  if (repositoryExsist) {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  } else {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, "failure");
    return;
  }

  const { data: BaseFiles } = await context.github.repos.getContents({
    owner: owner,
    repo: repo,
    path: "",
  });

  // Check if the repository is a fork
  checks.push({
    description: "Repository is not a fork",
    success: !repository.fork,
    canFail: true,
  });

  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the author of the PR is the owner of the repo
  checks.push({
    description: `${PRAuthor} is the owner of ${owner}/${repo}`,
    success: PRAuthor === owner,
    canFail: true,
    link: "https://hacs.xyz/docs/publish/include",
  });

  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository is archived
  checks.push({
    description: "Repository is not archived",
    success: !repository.archived,
  });

  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a description
  checks.push({
    description: "Repository has a description",
    success: repository.description !== null,
    link: "https://hacs.xyz/docs/publish/start#description",
  });

  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a README file
  const ReadmeExist =
    (BaseFiles as [any])
      .map((file) => file.name)
      .filter((file) => {
        return file.toLowerCase().includes("readme");
      }).length === 1;

  checks.push({
    description: "README file exist in the repository",
    success: ReadmeExist,
    link: "https://hacs.xyz/docs/publish/start#readme",
  });

  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a hacs.json file
  let manifest: any;
  let manifestIsValid!: boolean;
  try {
    const { data: hacsManifest } = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "hacs.json",
    });

    manifest = JSON.parse(
      Buffer.from((hacsManifest as any).content, "base64").toString()
    );
    manifestIsValid = true;
  } catch (error) {
    context.log(error);
    manifestIsValid = false;
  }

  checks.push({
    description: "hacs.json file exist in the repository, and is valid JSON",
    success: manifestIsValid,
    link: "https://hacs.xyz/docs/publish/start#hacsjson",
  });

  if (manifestIsValid) {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  } else {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, "failure");
    return;
  }

  // Check manifest content
  checks.push({
    description: "hacs.json have required information (name)",
    success: manifest.hasOwnProperty("name"),
    link: "https://hacs.xyz/docs/publish/start#hacsjson",
  });

  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Check if the repository has a INFO file
  if (manifest !== undefined) {
    if (!manifest.render_readme) {
      const InfoExist =
        (BaseFiles as [any])
          .map((file) => file.name)
          .filter((file) => {
            return file.toLowerCase().includes("info");
          }).length === 1;

      checks.push({
        description: "INFO file exist in the repository",
        success: InfoExist,
        link: "https://hacs.xyz/docs/publish/start#infomd",
      });

      await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
    }
  }
  // --------------------------------------------------------------------------------

  // Final CheckRun update
  await updateCheck(
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
