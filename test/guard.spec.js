import { createMachine } from "../src";
import { afterEach, describe, expect, it, vi } from "vitest";

let state = {
  id: "fgs",
  type: "parallel",
  states: {
    A: {
      initial: "INIT",
      states: {
        INIT: {
          on: {
            TO_FIRST: {
              cond: "guard",
              target: "NEXT",
            },
            TO_THIRD: {
              cond: "guard2",
              target: "FINAL",
            },
          },
        },
        NEXT: {
          on: {
            TO_SECOND: {
              target: "INIT",
            },
          },
        },
        FINAL: {},
      },
    },
    B: {
      initial: "INIT",
      states: {
        INIT: {
          initial: "INIT",
          states: {
            INIT: {
              on: {
                TO_FINAL: {
                  target: "FINAL",
                },
              },
            },
            FINAL: {
              type: "final",
            },
          },
          onDone: {
            cond: "guard",
            target: "FINAL",
          },
        },
        FINAL: {},
      },
    },
  },
};
let getGuard = () => "guard";
describe("reading messages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get the latest message with a spy", () => {
    const mock = vi.fn().mockImplementation(getGuard);
    let options = {
      guards: {
        guard: () => {
          mock();

          return true;
        },
        guard2: () => {
          mock();
          return false;
        },
      },
    };
    let machine = createMachine(state, options);
    expect(machine.currentState).toHaveLength(2);
    machine.transition("TO_FINAL");
    expect(machine.currentState).toContain(`#.B.FINAL`);
    expect(mock).toHaveBeenCalledTimes(1);
    machine.transition("TO_FIRST");
    expect(machine.currentState).toContain(`#.A.NEXT`);
    expect(mock).toHaveBeenCalledTimes(2);
    machine.transition("TO_SECOND");
    expect(machine.currentState).toContain(`#.A.INIT`);
    machine.transition("TO_THIRD");
    expect(mock).toHaveBeenCalledTimes(3);
    expect(machine.currentState).toContain(`#.A.INIT`);
  });
});
