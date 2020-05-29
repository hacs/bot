interface knownIssue {
  search: string[];
  lables: string[];
  message: string;
}

export const KNOWN_ISSUES: knownIssue[] = [
  {
    search: [
      "TypeError: expected string or bytes-like object",
      "match = self._regex.search(version)",
    ],
    lables: ["Issue not in HACS"],
    message: `You get the log entry \`TypeError: expected string or bytes-like object\` when HA could not install all the required dependecies for HACS.
There is nothing that can be done from HACS, since this happens _before_ HACS is started.

If you run docker, do not use a user/group for the container (stick to root).
If you have a \`deps\` dir in your config dir, delete it.`,
  },
  {
    search: [
      `Uncaught NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry': the name "hacs-frontendbase" has already been used with this registry`,
    ],
    lables: ["Issue not in HACS"],
    message: `You get (Uncaught NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry': the name "hacs-frontendbase" has already been used with this registry) in your logs every time you upgrade HACS, this **is** expected, to solve it clear your browser cache.`,
  },
];
