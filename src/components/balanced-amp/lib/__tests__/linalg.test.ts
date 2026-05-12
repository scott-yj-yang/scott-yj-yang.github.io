import { describe, it, expect } from "vitest";
import { eig2x2, applyW2, computeSumDiff } from "../linalg";

describe("eig2x2", () => {
  it("returns 0 and -w(kI-1) for the balanced E/I matrix", () => {
    const w = 2.138;
    const kI = 1.1;
    const W: [[number, number], [number, number]] = [
      [w, -kI * w],
      [w, -kI * w],
    ];
    const { eigenvalues } = eig2x2(W);
    expect(eigenvalues[0]).toBeCloseTo(0, 6);
    expect(eigenvalues[1]).toBeCloseTo(-w * (kI - 1), 6);
  });

  it("returns w (twice) for a Hebbian-style matrix [[w,0],[0,w]]", () => {
    const { eigenvalues } = eig2x2([[0.5, 0], [0, 0.5]]);
    expect(eigenvalues[0]).toBeCloseTo(0.5, 6);
    expect(eigenvalues[1]).toBeCloseTo(0.5, 6);
  });
});

describe("applyW2", () => {
  it("computes W*r for a 2-vector", () => {
    const W: [[number, number], [number, number]] = [[1, 2], [3, 4]];
    expect(applyW2(W, [5, 6])).toEqual([17, 39]);
  });
});

describe("computeSumDiff", () => {
  it("decomposes (rE, rI) into (sum, diff)", () => {
    const { sum, diff } = computeSumDiff(1, 0);
    expect(sum).toBeCloseTo(0.5, 6);
    expect(diff).toBeCloseTo(0.5, 6);
  });
});
