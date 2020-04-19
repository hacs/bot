import { Context } from "probot";

export const NAME = "extractTasks";

export interface ghTask {
  check: boolean;
  name: string;
}

export function extractTasks(context: Context) {
  const matchAll = /- \[( |)(x|X| |)(| )\] /;
  const matchChecked = /- \[( |)(x|X)(| )\] /;
  let ghTasks: ghTask[] = [];
  let check: boolean = false;
  let name: string;

  const issueOrPr = context.payload.issue || context.payload.pull_request;
  const lines = issueOrPr.body;

  lines.split("\n").forEach((line: string) => {
    if (!line.trim().startsWith("- [")) {
      return;
    }

    const lineSplit = line.split(matchAll);
    const check: boolean = matchChecked.test(line);
    const name: string = lineSplit[lineSplit.length - 1]
      .trim()
      .replace(/\\r/g, "");
    ghTasks.push({ check, name });
  });
  return ghTasks;
}
