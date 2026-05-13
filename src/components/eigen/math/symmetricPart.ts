import type { Matrix2x2 } from "./eig2x2";

/** Symmetric part J_S = (J + J^T) / 2 of a 2x2 matrix. */
export function symmetricPart(J: Matrix2x2): Matrix2x2 {
  const a = J[0][0];
  const d = J[1][1];
  const e = (J[0][1] + J[1][0]) / 2;
  return [[a, e], [e, d]];
}

/**
 * Eigendecomposition of a 2x2 symmetric matrix.
 * Returns eigenvalues sorted descending (largest first) and the corresponding
 * unit eigenvectors. Eigenvalues are always real for symmetric input.
 */
export function eigSymmetric2x2(S: Matrix2x2): {
  eigenvalues: [number, number];
  eigenvectors: [[number, number], [number, number]];
} {
  const a = S[0][0];
  const d = S[1][1];
  const e = S[0][1]; // assumes S[0][1] == S[1][0]
  const tr = a + d;
  const halfDiff = (a - d) / 2;
  const root = Math.sqrt(halfDiff * halfDiff + e * e);
  const lMax = tr / 2 + root;
  const lMin = tr / 2 - root;
  // Eigenvector for lMax: in the direction of [halfDiff + root, e] when e != 0,
  // else principal axes [1, 0] (if a >= d) or [0, 1].
  let vMax: [number, number];
  if (Math.abs(e) > 1e-12) {
    vMax = unit([halfDiff + root, e]);
  } else {
    vMax = a >= d ? [1, 0] : [0, 1];
  }
  // vMin is orthogonal to vMax (rotate 90°).
  const vMin: [number, number] = [-vMax[1], vMax[0]];
  return { eigenvalues: [lMax, lMin], eigenvectors: [vMax, vMin] };
}

function unit(v: [number, number]): [number, number] {
  const n = Math.hypot(v[0], v[1]);
  return n < 1e-12 ? [1, 0] : [v[0] / n, v[1] / n];
}
