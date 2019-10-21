import { Application } from 'probot'
import { Greeter } from "./plugins/Greeter"
import { Hacktoberfest } from "./plugins/Hacktoberfest"
import { ClearTempLabels } from "./plugins/ClearTempLabels"
import { NewDefaultRepository } from "./plugins/NewDefaultRepository"


export = (app: Application) => {
    Greeter(app)
    Hacktoberfest(app)

    NewDefaultRepository(app)

    ClearTempLabels(app)
}