import { expect, vi, it, describe, afterEach } from "vitest";

import { createMachine } from "../src";

let getActivity = () => "activity";
describe("activity test", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("basic", () => {
    const mock = vi.fn().mockImplementation(getActivity);

    const machine = createMachine(
      {
        initial: "loading",
        context: { value: 0 },
        states: {
          loading: {
            activites: "act",
            on: {
              CHANGE: "playing",
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
        activities: {
          act: () => {
            mock();
            return () => {
              mock();
            };
          },
        },
      }
    );
    expect(machine.currentState).toContain("#.loading");
    expect(mock).toHaveBeenCalledTimes(1);
    machine.transition(`CHANGE`);
    expect(mock).toHaveBeenCalledTimes(2);

    expect(machine.currentState).toContain("#.playing").toHaveLength(1);
  });
});
