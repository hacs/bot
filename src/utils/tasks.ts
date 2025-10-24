interface Task {
  checked: boolean
  description: string
}

interface Link {
  url: string
  repository?: string
}

export const extractTasks = (body: string): Task[] =>
  body
    .split('\n')
    .map(
      (line) =>
        /^-\s?\[\s?(?<checked>\w| |)\s?\] (?<description>.*)/.exec(line.trim())
          ?.groups,
    )
    .filter((groups) => groups !== undefined)
    .map((groups) => ({
      // @ts-expect-error its wrong
      checked: Boolean(groups.checked),
      // @ts-expect-error its wrong
      description: groups.description,
    }))

export const extractLinks = (body: string): Link[] => {
  const urlRegex = /https?:\/\/[^\s\)]+/g
  const matches = body.match(urlRegex) || []

  return matches.map((url) => {
    let repository: string | undefined

    // Check if it's a GitHub URL
    const githubMatch = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/.exec(url)
    if (githubMatch) {
      const owner = githubMatch[1]
      const repo = githubMatch[2]
      repository = `${owner}/${repo}`
    }

    return {
      url,
      repository,
    }
  })
}
