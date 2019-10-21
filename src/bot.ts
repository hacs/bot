import { Application } from 'probot'
import { AutoApprove } from "./plugins/AutoApprove"
import { Greeter } from "./plugins/Greeter"
import { Hacktoberfest } from "./plugins/Hacktoberfest"
import { ClearTempLabels } from "./plugins/ClearTempLabels"
import { NewDefaultRepository } from "./plugins/NewDefaultRepository"
import { ClosedIssue } from "./plugins/ClosedIssue"


export = (app: Application) => {
    Greeter(app)
    Hacktoberfest(app)

    NewDefaultRepository(app)

    ClosedIssue(app)
    ClearTempLabels(app)
    AutoApprove(app)
}