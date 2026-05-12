import { describe, expect, it } from "vitest";
import { integrate2x2 } from "@/components/eigen/math/integrate";
import type { Matrix2x2 } from "@/components/eigen/math/eig2x2";

const close = (a: number, b: number, tol: number) => Math.abs(a - b) < tol;

describe("integrate2x2", () => {
  it("decays to ~0 for stable diagonal matrix", () => {
    const W: Matrix2x2 = [[-1, 0], [0, -1]];
    const xs = integrate2x2(W, [1, 1], { dt: 0.01, steps: 1000 });
    expect(xs.length).toBe(1001);
    const last = xs[xs.length - 1];
    expect(close(last[0], 0, 1e-3)).toBe(true);
    expect(close(last[1], 0, 1e-3)).toBe(true);
  });

  it("blows up for unstable matrix", () => {
    const W: Matrix2x2 = [[2, 0], [0, 4]];
    const xs = integrate2x2(W, [0.01, 0.01], { dt: 0.01, steps: 200 });
    const last = xs[xs.length - 1];
    expect(Math.abs(last[1])).toBeGreaterThan(Math.abs(xs[0][1]) * 10);
  });

  it("preserves trajectory length and includes x0", () => {
    const xs = integrate2x2([[-1, 0], [0, -1]], [1, 0], { dt: 0.05, steps: 50 });
    expect(xs.length).toBe(51);
    expect(xs[0]).toEqual([1, 0]);
  });
});
