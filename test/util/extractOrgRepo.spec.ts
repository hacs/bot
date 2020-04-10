import * as assert from "assert";
import { NAME, extractOrgRepo } from "../../src/util/extractOrgRepo";

describe(NAME, () => {
  it("Extract org", () => {
    const org: string = "hacs";
    assert.deepEqual(
      extractOrgRepo({
        // @ts-ignore
        log: () => undefined,
        payload: {
          repository: { full_name: "hacs/bot" },
        },
      }).org,
      org
    );
  });
  it("Extract repo", () => {
    const repo: string = "bot";
    assert.deepEqual(
      extractOrgRepo({
        // @ts-ignore
        log: () => undefined,
        payload: {
          repository: { full_name: "hacs/bot" },
        },
      }).repo,
      repo
    );
  });
});
