import { describe, it, expect } from "vitest";
import { simulateLinearRK4 } from "../simulation";

describe("simulateLinearRK4", () => {
  it("solves dr/dt = -r/tau exactly (single neuron, no input)", () => {
    const tau = 1.0;
    const dt = 0.005;
    const tEnd = 2.0;
    const traj = simulateLinearRK4({
      W: [[0]],
      r0: [1.0],
      input: () => [0],
      tau,
      dt,
      tEnd,
    });
    const lastT = traj.t[traj.t.length - 1];
    const lastR = traj.r[traj.r.length - 1][0];
    expect(lastT).toBeCloseTo(tEnd, 4);
    expect(lastR).toBeCloseTo(Math.exp(-tEnd / tau), 4);
  });

  it("with no recurrence, sustained input gives r -> I in steady state", () => {
    const traj = simulateLinearRK4({
      W: [[0]],
      r0: [0],
      input: () => [1.0],
      tau: 0.5,
      dt: 0.01,
      tEnd: 5.0,
    });
    const lastR = traj.r[traj.r.length - 1][0];
    expect(lastR).toBeCloseTo(1.0, 3);
  });

  it("balanced 2-pop pulse response: rE rises above 1 then decays (paper Fig 1B)", () => {
    const w = 4 * Math.sqrt(2 / 7);
    const kI = 1.1;
    const W = [
      [w, -kI * w],
      [w, -kI * w],
    ];
    const traj = simulateLinearRK4({
      W,
      r0: [1, 0],
      input: () => [0, 0],
      tau: 1,
      dt: 0.001,
      tEnd: 8,
    });
    const rE = traj.r.map((r) => r[0]);
    const maxRE = Math.max(...rE);
    expect(maxRE).toBeGreaterThan(1.0);
    expect(traj.r[traj.r.length - 1][0]).toBeCloseTo(0, 2);
    expect(traj.r[traj.r.length - 1][1]).toBeCloseTo(0, 2);
  });
});
