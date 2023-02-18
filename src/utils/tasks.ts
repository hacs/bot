interface Task {
  checked: boolean
  description: string
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
