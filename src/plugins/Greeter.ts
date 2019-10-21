import { Application } from 'probot'

export const Greeter = (app: Application) => {
  app.on("issues.opened", async context => {
    if (context.isBot) return;

    await context.github.issues.createComment(
      context.issue({ body: NewIssue }))
  });

  app.on("pull_request.opened", async context => {
    if (context.isBot) return;

    await context.github.issues.createComment(
      context.issue({ body: NewPull }))
  });
}

const FunItems: string[] = [
    "[this cute kitten 😺](https://www.youtube.com/watch?v=0Bmhjf0rKe8)",
    "this awesome picture\n\n![image](https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sunset_2007-1.jpg/1280px-Sunset_2007-1.jpg)"
]

const NewPull: string = `
Automatic tasks are now running some initial checks before this can be merged.
When those are done, someone will manually ensure that that it's OK. 💃

While you wait, you can have a look at ${FunItems[Math.floor(Math.random()*FunItems.length)]}
`;

const NewIssue: string = `
Make sure you have read the [issue guidelines](https://hacs.xyz/docs/issues) and that you filled out the **entire** template.
`;