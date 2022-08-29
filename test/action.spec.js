import { afterEach, describe, expect, it, vi } from "vitest";
import { createMachine } from "../src";
const getAction = () => `action`;

describe("reading messages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get the latest message with a spy", () => {
    const mock = vi.fn().mockImplementation(getAction);
    const state = createMachine(
      {
        id: "fgs",
        initial: "A",
        states: {
          A: {
            type: "parallel",
            states: {
              parallel1: {
                initial: "INIT",
                states: {
                  INIT: {
                    on: {
                      TO_EVENT: {
                        actions: ["toEvent"],
                        target: "eventState",
                      },
                    },
                  },
                  eventState: {},
                },
              },
              parallel2: {},
            },
            on: {
              TO_B: {
                actions: ["toEvent"],
                target: "B",
              },
            },
          },
          B: {
            initial: "INIT",
            states: {
              INIT: {
                entry: "entryA1",
                exit: "exitA1",
                on: { TO_SUCCESS: "success" },
              },
              success: {
                // after: {
                //   500: {
                //     actions: ["toEvent"],
                //     target: "fail",
                //   },
                // },
              },
              fail: {},
            },
          },
        },
      },
      {
        actions: {
          entryA1: () => {
            mock();
          },
          exitA1: () => {
            mock();
          },
          toEvent: () => {
            mock();
          },
        },
      }
    );
    expect(state.currentState).toContain("#.A.parallel1.INIT");
    expect(state.currentState).toContain("#.A.parallel2");
    expect(state.currentState).toHaveLength(2);
    state.transition("TO_EVENT");
    expect(state.currentState).toContain("#.A.parallel1.eventState");
    expect(state.currentState).toHaveLength(2);
    expect(mock).toHaveBeenCalledTimes(1);
    state.transition("TO_B");
    expect(state.currentState).toContain("#.B.INIT");
    expect(state.currentState).toHaveLength(1);
    expect(mock).toHaveBeenCalledTimes(3);
    state.transition("TO_SUCCESS");
    expect(mock).toHaveBeenCalledTimes(4);
    expect(state.currentState).toContain("#.B.success");
    // setTimeout(() => {
    //   expect(state.currentState).toContain("#.B.fail");
    //   expect(mock).toHaveBeenCalledTimes(5);
    // }, 550);
  });
});
