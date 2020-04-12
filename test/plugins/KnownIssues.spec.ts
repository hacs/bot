import * as assert from "assert";
import { NAME, runKnownIssues } from "../../src/plugins/KnownIssues/plugin";
import { KNOWN_ISSUES } from "../../src/plugins/KnownIssues/list";

describe(NAME, () => {
  it("Known issue found", async () => {
    let setBody: string;
    let setLabels: any;

    await runKnownIssues({
      // @ts-ignore
      log: () => undefined,
      payload: {
        issue: {
          base: { ref: "master" },
          body:
            "TypeError: expected string or bytes-like object, match = self._regex.search(version)",
        },
        sender: { login: "someone", type: "User" },
      },
      // @ts-ignore
      issue: (val) => val,
      github: {
        issues: {
          // @ts-ignore
          async createComment(body) {
            setBody = body;
          },
          // @ts-ignore
          async addLabels(labels) {
            setLabels = labels;
          },
        },
      },
    });
    assert.deepEqual(setBody, {
      body: KNOWN_ISSUES.filter((issue) => {
        return (
          issue.search.includes(
            "TypeError: expected string or bytes-like object"
          ) && issue.search.includes("match = self._regex.search(version)")
        );
      })[0].message,
    });
    assert.deepEqual(setLabels, {
      labels: ["Issue not in HACS"],
    });
  });
  it("No known issues", async () => {
    await runKnownIssues({
      // @ts-ignore
      log: () => undefined,
      payload: {
        issue: {
          base: { ref: "master" },
          body: "",
        },
        sender: { login: "someone" },
      },
    });
  });
});
