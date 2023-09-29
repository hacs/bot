export const postDiscordMessage = async (
  content: Record<string, any>,
): Promise<void> => {
  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })
}
