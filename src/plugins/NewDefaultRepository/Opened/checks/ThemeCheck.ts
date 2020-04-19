import { Context } from "probot";
import { contextData } from "../../../../util/context";
import { Check, updateCheck, createCheck } from "./Status";

const TITLE = "HACS Category checks";

export async function ThemeCheck(
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

  // Check if the themes directory exist in the repository
  let dirExsist!: boolean;
  try {
    await context.github.repos.getContents({
      owner: owner,
      repo: repo,
      path: "themes",
    });
    dirExsist = true;
  } catch (error) {
    dirExsist = false;
  }

  checks.push({
    description: "'themes' directory exist in the repository",
    success: dirExsist,
    link: "https://hacs.xyz/docs/publish/theme#repository-structure",
  });

  // await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks);
  // --------------------------------------------------------------------------------

  // Final CheckRun update
  await updateCheck(context, PRSHA, CheckRun.id, TITLE, checks, true);
}
