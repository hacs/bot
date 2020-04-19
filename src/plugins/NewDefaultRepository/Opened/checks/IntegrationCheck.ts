import { Context } from "probot";
import { contextData } from "../../../../util/context";
import { Check, updateCheck, createCheck } from "./Status";

const TITLE = "HACS Category checks";

export async function IntegrationCheck(
  context: Context,
  owner: string,
  repo: string
) {
  const { data: PR } = await context.github.pulls.get(
    new contextData(context.issue()).pull
  );

  const PRSHA = PR.head.sha;

  const checks: Check[] = [];

  const { data: CheckRun } = await createCheck(context, PRSHA, TITLE);

  // Check if the custom_components directory exist in the repository
  let dirExsist!: boolean;
  let cc: any;
  try {
    cc = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "custom_components",
    });
    dirExsist = true;
  } catch (error) {
    dirExsist = false;
  }

  checks.push({
    description: "'custom_components' directory exist in the repository",
    success: dirExsist,
    link: "https://hacs.xyz/docs/publish/integration#repository-structure",
  });

  if (!dirExsist) {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, true);
    return;
  } else {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  }
  // --------------------------------------------------------------------------------

  // Check if the integration manifest exist in the repository
  let manifest: any;
  let manifestValid!: boolean;
  try {
    const IntegrationManifest = await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: (cc as any).data[0].path + "/manifest.json",
    });

    manifest = JSON.parse(
      Buffer.from(
        (IntegrationManifest.data as any).content,
        "base64"
      ).toString()
    );

    manifestValid = true;
  } catch (error) {
    manifestValid = false;
  }

  checks.push({
    description: "Integration manifest does exist and is valid JSON",
    success: manifestValid,
    link: "https://hacs.xyz/docs/publish/integration#repository-structure",
  });

  if (!manifestValid) {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, true);
    return;
  } else {
    await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  }

  checks.push({
    description: "Integration manifest has a 'domain' key",
    success: manifest.hasOwnProperty("domain"),
  });
  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);

  checks.push({
    description: "Integration manifest has a 'documentation' key",
    success: manifest.hasOwnProperty("documentation"),
  });
  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);

  checks.push({
    description: "Integration manifest has a 'name' key",
    success: manifest.hasOwnProperty("name"),
  });
  //await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);

  // --------------------------------------------------------------------------------

  // Final CheckRun update
  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, true);
}
