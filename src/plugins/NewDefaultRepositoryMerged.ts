import { Application } from 'probot'
import axios from 'axios';
import { ExecutionFilter } from './ExecutionFilter'


export const NewDefaultRepositoryMerged = (app: Application) => {
      app.on("pull_request.closed", async context => {
        if (!ExecutionFilter(context)) return;
        if (context.repo().owner !== "hacs" && context.repo().owner !== "default") return;
        const {data: Pull} = await context.github.pullRequests.get(context.issue())
        const titleElements = Pull.title.split(" ")
        const owner_repo = titleElements[3].replace("[", "").replace("]", "")
        const Category = titleElements[2]

        if (!Pull.merged) return;


        const { data: Repo } = await context.github.repos.get(
          {
            owner: owner_repo.split("/")[0],
            repo: owner_repo.split("/")[1]
          })

          const DiscordWebHook = (process.env.DiscordWebHook as string);

      const EmbedForDiscord = {
        "embeds": [
          {
            "title": "New repository added to HACS :tada:",
            "color": "3066993",
            "fields":
              [
                {
                  "name": "Repository link",
                  "value": Repo.html_url
                },
                {
                  "name": "Category",
                  "value": Category
                },
                {
                  "name": "Description",
                  "value": Repo.description
                }
              ]
            }
          ]
        }

        axios.post(DiscordWebHook, EmbedForDiscord)
    });
};
