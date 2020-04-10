import * as assert from "assert";
import { NAME, extractLabels } from "../../src/util/extractLabels";

describe(NAME, () => {
  it("Has labels", () => {
    const labels: any = [{ id: 1337, name: "test" }];
    assert.deepEqual(
      extractLabels({
        // @ts-ignore
        log: () => undefined,
        payload: {
          issue: { labels },
          repository: { full_name: "hacs/bot" },
        },
      }),
      labels
    );
  });
  it("No labels", () => {
    const labels: any = [];
    assert.deepEqual(
      extractLabels({
        // @ts-ignore
        log: () => undefined,
        payload: {
          pull_request: { labels },
          repository: { full_name: "hacs/bot" },
        },
      }),
      labels
    );
  });
});
