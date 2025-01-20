export const postDiscordMessage = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>,
): Promise<void> => {
  const resp = await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })
  console.log(await resp.text())
}
