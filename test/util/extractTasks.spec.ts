import * as assert from "assert";
import { NAME, extractTasks, ghTask } from "../../src/util/extractTasks";

describe(NAME, () => {
  it("No tasks", () => {
    const taskTarget = [];
    assert.deepEqual(
      extractTasks({
        // @ts-ignore
        log: () => undefined,
        payload: {
          issue: {
            body: "",
          },
        },
      }),
      taskTarget
    );
  });
  it("One task, checked", () => {
    const taskTarget: ghTask[] = [{ check: true, name: "Test" }];
    assert.deepEqual(
      extractTasks({
        // @ts-ignore
        log: () => undefined,
        payload: {
          issue: {
            body: "- [x] Test",
          },
        },
      }),
      taskTarget
    );
  });
  it("Two tasks, unchecked", () => {
    const taskTarget: ghTask[] = [
      { check: false, name: "Test" },
      { check: false, name: "Test2" },
    ];
    assert.deepEqual(
      extractTasks({
        // @ts-ignore
        log: () => undefined,
        payload: {
          issue: {
            body: "- [ ] Test\r\n  - [ ] Test2",
          },
        },
      }),
      taskTarget
    );
  });
});
