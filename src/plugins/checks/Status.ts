import { Context } from "probot";
export const StatusSuccess = "✅ ";
export const StatusFailed = "❌ ";
export const StatusNeutral = "⬜️ ";
const newLine = "\n";

const StatusIconDescription: string = `\n\n\n\n
## Status icon desctiptions

Icon | Description
-- | --
${StatusSuccess} | Check passed successfully
${StatusNeutral} | An optional check failed, this will require a manual review
${StatusFailed} | Check failed, this needs to be corrected before the PR can be merged

## Checks\n\n
`;

export interface Check {
  description: string;
  canFail: boolean;
  success: boolean;
  link?: string;
}

interface StatusData {
  head_sha: string;
  output: any;
}

interface UpdateData extends StatusData {
  check_run_id: number;
  conclusion?: "success" | "failure" | "neutral";
}

interface CreateData extends StatusData {
  details_url: string;
  name: string;
}

export async function updateCheck(
  context: Context,
  sha: string,
  id: number,
  title: string,
  checks: Check[],
  conclusion?: "success" | "failure" | "neutral"
) {
  let summary: string = StatusIconDescription;
  checks.forEach((check) => {
    summary += check.success
      ? StatusSuccess
      : check.canFail
      ? StatusNeutral
      : StatusFailed;
    summary += check.link
      ? `[${check.description}](${check.link})`
      : check.description;
    summary += newLine;
  });

  const data: UpdateData = {
    head_sha: sha,
    check_run_id: id,
    output: { title, summary },
  };

  if (conclusion) {
    data.conclusion = conclusion;
  }

  await context.github.checks.update(context.issue(data));
}

export async function createCheck(context: Context, sha: string, name: string) {
  let summary: string = StatusIconDescription;

  const data: CreateData = {
    head_sha: sha,
    name,
    output: { title: name, summary },
    details_url: "https://hacs.xyz/docs/publish/start",
  };

  return await context.github.checks.create(context.issue(data));
}
