import { Context } from "probot";

export const NAME = "Filter";
export const ADMINS = ["ludeeus"];

export function senderIsAdmin(context: Context) {
  return ADMINS.includes(context.payload.sender.login);
}

export function senderIsBot(context: Context) {
  context.log(context.payload.sender.type);
  return context.payload.sender.type === "Bot";
}
