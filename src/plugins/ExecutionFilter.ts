import { Context } from "probot";

export function ExecutionFilter(context: Context) {
  if (context.isBot) return false;
  if (
    context.payload.repository.name === "hacs" ||
    context.payload.organization.login === "hacs"
  )
    return true;
  return false;
}

export function IsAdmin(context: Context) {
  const admins = ["ludeeus"];
  if (admins.includes(context.payload.sender.login)) return true;
  return false;
}
