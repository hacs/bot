import { Application } from 'probot'
import { Greeter } from "./plugins/Greeter"
import { Hacktoberfest } from "./plugins/Hacktoberfest"
import { ClearTempLabels } from "./plugins/ClearTempLabels"
import { NewDefaultRepository } from "./plugins/NewDefaultRepository"
import { ClosedIssue } from "./plugins/ClosedIssue"


export = (app: Application) => {
    Init(app)
}

const Init = (app: Application) => {
    app.on("*", async context => {
        if (context.isBot) return;
        if (context.payload.repository.name === "hacs" || context.payload.organization.login === "hacs") {
            Greeter(app)
            Hacktoberfest(app)
        
            NewDefaultRepository(app)
        
            ClosedIssue(app)
            ClearTempLabels(app)
        } else {
            console.log(`${context.payload.organization.login}/${context.payload.repository.name} is not allowed to use this bot.`)
        }
    });
}