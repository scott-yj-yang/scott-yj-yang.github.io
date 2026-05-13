import { describe, expect, it } from "vitest";
import { symmetricPart, eigSymmetric2x2 } from "@/components/eigen/math/symmetricPart";
import type { Matrix2x2 } from "@/components/eigen/math/eig2x2";

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol;

describe("symmetricPart", () => {
  it("symmetrizes off-diagonals", () => {
    const J: Matrix2x2 = [[1, 4], [0, -2]];
    expect(symmetricPart(J)).toEqual([[1, 2], [2, -2]]);
  });
});

describe("eigSymmetric2x2", () => {
  it("returns descending eigenvalues for diagonal matrix", () => {
    const { eigenvalues } = eigSymmetric2x2([[3, 0], [0, -5]]);
    expect(close(eigenvalues[0], 3)).toBe(true);
    expect(close(eigenvalues[1], -5)).toBe(true);
  });

  it("eigenvectors are orthogonal and unit length", () => {
    const S: Matrix2x2 = [[2, 1], [1, 4]];
    const { eigenvectors } = eigSymmetric2x2(S);
    const [v1, v2] = eigenvectors;
    expect(close(Math.hypot(v1[0], v1[1]), 1)).toBe(true);
    expect(close(Math.hypot(v2[0], v2[1]), 1)).toBe(true);
    expect(close(v1[0] * v2[0] + v1[1] * v2[1], 0)).toBe(true);
  });

  it("largest eigenvalue + eigenvector satisfy S v = λ v", () => {
    const S: Matrix2x2 = [[1, 2], [2, 3]];
    const { eigenvalues, eigenvectors } = eigSymmetric2x2(S);
    const [lMax] = eigenvalues;
    const [vMax] = eigenvectors;
    const Sv: [number, number] = [
      S[0][0] * vMax[0] + S[0][1] * vMax[1],
      S[1][0] * vMax[0] + S[1][1] * vMax[1],
    ];
    expect(close(Sv[0], lMax * vMax[0], 1e-9)).toBe(true);
    expect(close(Sv[1], lMax * vMax[1], 1e-9)).toBe(true);
  });
});
