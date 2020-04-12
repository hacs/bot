interface knownIssue {
  search: string[];
  message: string;
}

export const KNOWN_ISSUES: knownIssue[] = [
  {
    search: [
      "TypeError: expected string or bytes-like object",
      "match = self._regex.search(version)",
    ],
    message: `You get the log entry \`TypeError: expected string or bytes-like object\` when HA could not install all the required dependecies for HACS.
There is nothing that can be done from HACS, since this happens _before_ HACS is started.

If you run docker, do not use a user/group for the container (stick to root).
If you have a \`deps\` dir in your config dir, delete it.`,
  },
];
