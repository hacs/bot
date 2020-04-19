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
  it("Four tasks, one unchecked", () => {
    const taskTarget: ghTask[] = [
      { check: true, name: "You are submitting only 1 repository." },
      {
        check: true,
        name:
          "You repository is compliant with https://hacs.xyz/docs/publish/start",
      },
      {
        check: false,
        name:
          "You have tested it with HACS by adding it as a custom repository.",
      },
      { check: true, name: "The list are still alphabetical after my change." },
    ];
    assert.deepEqual(
      extractTasks({
        // @ts-ignore
        log: () => undefined,
        payload: {
          issue: {
            body:
              "Before you submit a pull request, please make sure you have done the following:\r\n" +
              "\r\n" +
              "- [x] You are submitting only 1 repository.\r\n" +
              "- [x] You repository is compliant with https://hacs.xyz/docs/publish/start\r\n" +
              "- [ ] You have tested it with HACS by adding it as a custom repository.\r\n" +
              "- [x] The list are still alphabetical after my change.\r\n" +
              "\r\n" +
              "<!-- You as the submitter need to check all these boxes before it's mergable -->",
          },
        },
      }),
      taskTarget
    );
  });
});
