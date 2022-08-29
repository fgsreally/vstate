import { expect } from "vitest";
import { test } from "vitest";
import { createMachine } from "../src";

test("basic after", () => {
  const machine = createMachine(
    {
      initial: "loading",
      states: {
        loading: {
          after: {
            500: {
              target: "playing",
            },
            1000: `paused`,
          },
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
  setTimeout(() => {
    expect(machine.currentState).toContain("#.playing");
    expect(machine.currentState).toHaveLength(1);
  }, 1100);
});
