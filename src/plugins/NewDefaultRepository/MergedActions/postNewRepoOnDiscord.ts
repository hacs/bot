import axios from "axios";
export async function postNewRepoOnDiscord(repo: any, category: string) {
  const EmbedForDiscord = {
    embeds: [
      {
        title: "New repository added to HACS :tada:",
        color: "3066993",
        fields: [
          {
            name: "Repository link",
            value: repo.html_url,
          },
          {
            name: "Category",
            value: category,
          },
          {
            name: "Description",
            value: repo.description,
          },
        ],
      },
    ],
  };
  const DiscordWebHook = process.env.DiscordWebHook as string;
  axios.post(DiscordWebHook, EmbedForDiscord);
}
