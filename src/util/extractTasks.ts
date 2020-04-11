import { Context } from "probot";

export const NAME = "extractTasks";

export interface ghTask {
  check: boolean;
  name?: string;
}

export function extractTasks(context: Context) {
  let ghTasks: ghTask[] = [];
  const issueOrPr = context.payload.issue || context.payload.pull_request;
  const lines = issueOrPr.body;

  lines.split("\n").forEach((line: string) => {
    if (!line.trim().startsWith("- [")) {
      return;
    }

    let newTask: ghTask = { check: false };
    if (/- \[(x|X)\]/.test(line)) {
      newTask.check = true;
    }
    newTask.name = line
      .split(/- \[(x|X| )\] /)
      [line.split(/- \[(x|X| )\] /).length - 1].trim()
      .replace(/\\r/g, "");
    ghTasks.push(newTask);
  });
  return ghTasks;
}
