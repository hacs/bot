import * as assert from "assert";
import { NAME, runDebug } from "../../src/plugins/Debug";

describe(NAME, () => {
  it("runDebug", async () => {
    await runDebug({
      // @ts-ignore
      log: () => undefined,
      payload: {
        somekey: "somevalue",
        repository: { full_name: "hacs/bot" },
        issue: {
          body:
            "Before you submit a pull request, please make sure you have done the following:\r\n" +
            "\r\n" +
            "- [x] You are submitting only 1 repository.\r\n" +
            "- [x] You repository is compliant with https://hacs.xyz/docs/publish/start\r\n" +
            "- [x] You have tested it with HACS by adding it as a custom repository.\r\n" +
            "- [x] The list are still alphabetical after my change.\r\n" +
            "\r\n" +
            "<!-- You as the submitter need to check all these boxes before it's mergable -->",
        },
      },
    });
  });
});
