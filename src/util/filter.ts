import { Context } from "probot";

export const NAME = "Filter";
export const ADMINS = ["ludeeus"];

export function senderIsAdmin(context: Context) {
  return ADMINS.includes(context.payload.sender.login);
}

export function senderIsBot(context: Context) {
  if (context.payload.sender.type === "User") return false;
  return true;
}
