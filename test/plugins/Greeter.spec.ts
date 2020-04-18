import * as assert from "assert";
import { NAME, runGreeter } from "../../src/plugins/Greeter/plugin";
import { messageNewIssue } from "../../src/messages";

describe(NAME, () => {
  it("runGreeter on new issues", async () => {
    let setBody: string;
    await runGreeter({
      // @ts-ignore
      log: () => undefined,
      payload: {
        issue: {
          base: { ref: "master" },
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
        },
      },
    });
    assert.deepEqual(setBody, {
      body: messageNewIssue,
    });
  });
  it("Sikp runGreeter on invalid issues", async () => {
    await runGreeter({
      // @ts-ignore
      log: () => undefined,
      payload: {
        issue: {
          base: { ref: "master" },
          labels: [{ name: "invalid" }],
        },
        sender: { login: "someone" },
      },
    });
  });
});
