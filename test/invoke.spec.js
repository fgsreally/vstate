import { test, expect } from "vitest";
import { createMachine } from "../src";

const state = {
  id: "fgs",
  type: "parallel",
  states: {
    A: {
      invoke: {
        src: "TEST",
        id: "TEST",
        onDone: [
          {
            target: "B",
          },
        ],
        onError: [
          {
            target: "C",
          },
        ],
      },
      initial: "INIT",
      states: {
        INIT: {},
      },
    },
    B: {},
    C: {},
  },
};
let options = {
  services: {
    TEST: (ctx) => {
      return new Promise((resolve, reject) => {
        if (ctx.value > 0) {
          resolve();
        } else {
          reject();
        }
      });
    },
  },
};
test("onError", () => {
  state.context = { value: -1 };
  const machine = createMachine(state, options);
  expect(machine.currentState).toContain(`#.C`);
});

test("onDone", () => {
  state.context = { value: 1 };
  const machine = createMachine(state, options);
  expect(machine.currentState).toContain(`#.B`);
});
