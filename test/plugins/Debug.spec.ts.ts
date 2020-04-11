import * as assert from "assert";
import { NAME, runDebug } from "../../src/plugins/Debug";

describe(NAME, () => {
  it("runDebug", async () => {
    await runDebug({
      // @ts-ignore
      log: () => undefined,
      payload: { somekey: "somevalue" },
    });
  });
});
