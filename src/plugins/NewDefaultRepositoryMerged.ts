import { Application } from 'probot'
import { ExecutionFilter } from './ExecutionFilter'


export const NewDefaultRepositoryMerged = (app: Application) => {
      app.on("pull_request.merged", async context => {
        if (!ExecutionFilter(context)) return;
        if (context.repo().owner !== "hacs" && context.repo().owner !== "default") return;

        const {data: Pull} = await context.github.pullRequests.get(context.issue())

        console.log(`DEBUG
        
        
        
        
        
        -----------------------------------------------`)

      console.log(`Title: ${Pull.title}`)
      console.log(`Merged: ${Pull.merged}`)
      console.log(`Labels: ${Pull.labels}`)
      const Split = Pull.title.split(" ")
      console.log(`Title split: ${Split}`)
      console.log(`Title split[0]: ${Split[0]}`)
      console.log(`Title split[1]: ${Split[1]}`)
      console.log(`Title split[2]: ${Split[2]}`)
      console.log(`Title split[3]: ${Split[3]}`)
      console.log(`Title split[4]: ${Split[4]}`)
    });
};
