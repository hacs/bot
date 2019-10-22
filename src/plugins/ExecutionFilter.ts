import { Context } from 'probot'

export function ExecutionFilter(context: Context) {
    if (context.isBot) return false;
    if (context.payload.repository.name === "hacs" 
        || context.payload.organization.login === "hacs") return true;
    return false
}