import { describe, expect, it } from "vitest";
import { sample, type SampleSpec } from "@/components/eigen/math/randomMatrix";

describe("randomMatrix.sample", () => {
  it("iid mode produces NxN matrix with expected variance", () => {
    const M = sample({ mode: "iid", N: 200, sigma: 1, seed: 42 } satisfies SampleSpec);
    expect(M.length).toBe(200);
    expect(M[0].length).toBe(200);
    let sum = 0, sq = 0, n = 0;
    for (const row of M) for (const v of row) { sum += v; sq += v * v; n++; }
    const mean = sum / n;
    const variance = sq / n - mean * mean;
    expect(Math.abs(mean)).toBeLessThan(0.02);
    expect(variance).toBeCloseTo(1 / 200, 2);
  });

  it("symmetric mode produces symmetric matrix", () => {
    const M = sample({ mode: "symmetric", N: 50, sigma: 1, seed: 1 });
    for (let i = 0; i < 50; i++)
      for (let j = 0; j < 50; j++)
        expect(M[i][j]).toBe(M[j][i]);
  });

  it("ei mode: first f*N columns have positive mean, rest negative", () => {
    const N = 100;
    const f = 0.8;
    const M = sample({ mode: "ei", N, sigma: 1, f, muE: 1, muI: -4, seed: 7 });
    let sumExc = 0, sumInh = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < f * N; j++) sumExc += M[i][j];
      for (let j = f * N; j < N; j++) sumInh += M[i][j];
    }
    expect(sumExc).toBeGreaterThan(0);
    expect(sumInh).toBeLessThan(0);
  });

  it("seeded sampler is deterministic", () => {
    const a = sample({ mode: "iid", N: 10, sigma: 1, seed: 99 });
    const b = sample({ mode: "iid", N: 10, sigma: 1, seed: 99 });
    expect(a).toEqual(b);
  });

  it("elliptic mode: rho=1 gives symmetric off-diagonal pairs", () => {
    const M = sample({ mode: "elliptic", N: 20, sigma: 1, rho: 1, seed: 5 });
    for (let i = 0; i < 20; i++)
      for (let j = i + 1; j < 20; j++)
        expect(M[i][j]).toBeCloseTo(M[j][i], 10);
  });

  it("multipop mode: returns a valid NxN matrix", () => {
    const M = sample({ mode: "multipop", N: 30, alpha: 0.5, sigmaE: 1, sigmaI: 2, seed: 3 });
    expect(M.length).toBe(30);
    expect(M[0].length).toBe(30);
  });
});
