import * as assert from "assert";
import {
  NAME,
  openAction,
  HacktoberFestMessage,
} from "../../src/plugins/Hacktoberfest";

describe(NAME, () => {
  it("On open", async () => {
    let setBody: string;
    return;

    await openAction({
      // @ts-ignore
      log: () => undefined,
      payload: {
        pull_request: {
          base: { ref: "master" },
        },
        sender: { login: "someone" },
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
          async listLabelsForRepo([]) {},
        },
      },
    });
    assert.deepEqual(setBody, {
      body: HacktoberFestMessage,
    });
  });
});
