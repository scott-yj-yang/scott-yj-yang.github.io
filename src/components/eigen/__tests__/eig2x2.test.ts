import { describe, expect, it } from "vitest";
import {
  eig2x2,
  matrixFromEigenvalues,
  type Matrix2x2,
} from "@/components/eigen/math/eig2x2";

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol;

describe("eig2x2", () => {
  it("real diagonal matrix", () => {
    const W: Matrix2x2 = [[-10, 0], [0, -2]];
    const e = eig2x2(W);
    expect(e.kind).toBe("real");
    expect(close(e.lambda1.re, -10)).toBe(true);
    expect(close(e.lambda2.re, -2)).toBe(true);
    expect(close(e.lambda1.im, 0)).toBe(true);
  });

  it("complex pair from rotation+scale matrix", () => {
    const W: Matrix2x2 = [[1, -3.4641], [3.4641, 1]];
    const e = eig2x2(W);
    expect(e.kind).toBe("complex");
    expect(close(e.lambda1.re, 1, 1e-3)).toBe(true);
    expect(close(Math.abs(e.lambda1.im), 3.4641, 1e-3)).toBe(true);
  });

  it("paper Fig 2C matrix has complex eigenvalues with real part -1", () => {
    const W: Matrix2x2 = [[1, -8], [2, -3]];
    const e = eig2x2(W);
    expect(e.kind).toBe("complex");
    expect(close(e.lambda1.re, -1, 1e-9)).toBe(true);
    expect(close(Math.abs(e.lambda1.im), 3.4641, 1e-3)).toBe(true);
  });
});

describe("matrixFromEigenvalues", () => {
  it("real pair with theta=0 returns diagonal matrix", () => {
    const W = matrixFromEigenvalues({ re: -3, im: 0 }, { re: -7, im: 0 }, 0, "real");
    expect(W).toEqual([[-3, 0], [0, -7]]);
  });

  it("complex pair with theta=0 returns rotation+scale matrix", () => {
    const W = matrixFromEigenvalues({ re: 2, im: 3 }, { re: 2, im: -3 }, 0, "complex");
    expect(close(W[0][0], 2)).toBe(true);
    expect(close(W[0][1], -3)).toBe(true);
    expect(close(W[1][0], 3)).toBe(true);
    expect(close(W[1][1], 2)).toBe(true);
  });

  it("round-trip: matrix -> eigenvalues -> matrix recovers original (real, theta=0)", () => {
    const W: Matrix2x2 = [[-5, 0], [0, 1]];
    const e = eig2x2(W);
    const W2 = matrixFromEigenvalues(e.lambda1, e.lambda2, 0, "real");
    expect(close(W[0][0], W2[0][0])).toBe(true);
    expect(close(W[1][1], W2[1][1])).toBe(true);
  });
});
