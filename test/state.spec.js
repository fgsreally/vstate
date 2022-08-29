import { test, expect } from "vitest";
import { createMachine } from "../src";

const TEST = createMachine(
  {
    id: "fgs",
    type: "parallel",
    states: {
      C: {
        initial: "INIT",
        states: {
          INIT: {
            on: {
              TO_FIRST: {
                target: "NEXT",
              },
              TO_THIRD: {
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
      A: {
        initial: "INIT",
        states: {
          INIT: {
            initial: "INIT",
            states: {
              INIT: {
                on: {
                  TO_NEXT: {
                    target: "NEXT",
                  },
                  TO_HISTORY: {
                    target: "HISTORY",
                  },
                },
              },
              HISTORY: {
                type: "history",
                history: "shallow",
              },
              NEXT: {},
            },
            on: {
              TO_FOURTH: {
                target: "NEXT",
              },
            },
          },
          NEXT: {
            on: {
              TO_FIVTH: {
                target: "INIT",
              },
            },
          },
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
              target: "FINAL",
            },
          },
          FINAL: {},
        },
      },
    },
  },
  {}
);
test("basic state change", () => {
  const machine = createMachine(
    {
      initial: "loading",
      states: {
        loading: {
          on: {
            LOADED: "playing",
          },
        },
        playing: {
          on: {
            PAUSE: "paused",
          },
        },
        paused: {
          on: {
            PLAY: "playing",
          },
        },
      },
    },
    {}
  );

  expect(machine.currentState).toContain("#.loading");
  machine.transition("LOADED");
  expect(machine.currentState).toContain("#.playing");
  machine.transition("PAUSE");
  expect(machine.currentState).toContain("#.paused");
  machine.transition("PLAY");
  expect(machine.currentState).toContain("#.playing");
});

test("history state node", () => {
  expect(TEST.currentState).toHaveLength(3);
  TEST.transition("TO_NEXT");
  expect(TEST.currentState).toContain(`#.A.INIT.NEXT`);
  TEST.transition("TO_FOURTH");
  expect(TEST.currentState).toContain(`#.A.NEXT`);
  TEST.transition("TO_FIVTH");
  expect(TEST.currentState).toContain(`#.A.INIT.INIT`);
  TEST.transition("TO_HISTORY");
  expect(TEST.currentState).toContain(`#.A.INIT.NEXT`);
});

test("final state node", () => {
  expect(TEST.currentState).toContain(`#.B.INIT.INIT`);
  TEST.transition("TO_FINAL");
  expect(TEST.currentState).toContain(`#.B.FINAL`);
});

test("normal state node", () => {
  expect(TEST.currentState).toContain(`#.C.INIT`);
  TEST.transition("TO_FIRST");
  expect(TEST.currentState).toContain(`#.C.NEXT`);
  TEST.transition("TO_SECOND");
  expect(TEST.currentState).toContain(`#.C.INIT`);
  TEST.transition("TO_THIRD");
  expect(TEST.currentState).toContain(`#.C.FINAL`);
});
