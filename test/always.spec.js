import { expect } from "vitest";
import { test } from "vitest";
import { createMachine } from "../src";

test("basic after", () => {
  const machine = createMachine(
    {
      initial: "loading",
      context: { value: 0 },
      states: {
        loading: {
          always: { target: "paused", cond: "test" },
          on: {
            CHANGE: { actions: "change" },
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
    {
      actions: {
        change: (ctx) => {
          ctx.value = 20;
        },
      },
      guards: {
        test: (ctx) => {
          return ctx.value > 15;
        },
      },
    }
  );
  expect(machine.currentState).toContain("#.loading");
  machine.transition(`CHANGE`);
  expect(machine.currentState).toContain("#.paused").toHaveLength(1);
});
