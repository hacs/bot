import * as assert from "assert";
import { NAME, senderIsAdmin, senderIsBot } from "../src/util/filter";

describe(NAME, () => {
  it("Sender is admin", async () => {
    let setBody: string;
    assert.deepEqual(
      await senderIsAdmin({
        // @ts-ignore
        log: () => undefined,
        payload: {
          sender: { login: "ludeeus" },
        },
      }),
      true
    );
  });
  it("Sender is not admin", async () => {
    let setBody: string;
    assert.deepEqual(
      await senderIsAdmin({
        // @ts-ignore
        log: () => undefined,
        payload: {
          sender: { login: "someone" },
        },
      }),
      false
    );
  });
  it("Sender is bot", async () => {
    assert.deepEqual(
      await senderIsBot({
        // @ts-ignore
        log: () => undefined,
        payload: {
          sender: { type: "bot" },
        },
      }),
      true
    );
  });
  it("Sender is not bot", async () => {
    assert.deepEqual(
      await senderIsBot({
        // @ts-ignore
        log: () => undefined,
        payload: {
          sender: { type: "User" },
        },
      }),
      false
    );
  });
});
