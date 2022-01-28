import { IssuePullPayload } from "../types";

export const NAME = "Filter";
export const ADMINS = ["ludeeus"];

export const senderIsAdmin = (payload: IssuePullPayload): boolean => ADMINS.includes(payload.sender.login);
export const senderIsBot = (payload: IssuePullPayload): boolean =>  payload.sender.type !== "User";


