export type Complex = { re: number; im: number };
export type Matrix2x2 = [[number, number], [number, number]];
export type EigKind = "real" | "complex";
export type EigPair = {
  kind: EigKind;
  lambda1: Complex;
  lambda2: Complex;
};

export function eig2x2(W: Matrix2x2): EigPair {
  const [[a, b], [c, d]] = W;
  const tr = a + d;
  const disc = (a - d) * (a - d) + 4 * b * c;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return {
      kind: "real",
      lambda1: { re: (tr - s) / 2, im: 0 },
      lambda2: { re: (tr + s) / 2, im: 0 },
    };
  }
  const im = Math.sqrt(-disc) / 2;
  return {
    kind: "complex",
    lambda1: { re: tr / 2, im },
    lambda2: { re: tr / 2, im: -im },
  };
}

/**
 * Build a real 2x2 matrix from a desired eigenvalue pair plus an eigenvector skew angle θ.
 *
 * Conventions:
 * - For `kind: "complex"`, `lambda1.im` is treated as the magnitude of the imaginary
 *   part (the function uses `Math.abs(lambda1.im)`). Pass the conjugate pair with
 *   `lambda1.im >= 0` and `lambda2 = conjugate(lambda1)`.
 * - For `kind: "real"`, when `theta` lies near a multiple of π (so `sin(theta) ≈ 0`)
 *   the V-basis becomes singular; in that case the function returns the canonical
 *   diagonal form `diag(lambda1, lambda2)` rather than throwing.
 */
export function matrixFromEigenvalues(
  lambda1: Complex,
  lambda2: Complex,
  theta: number,
  kind: EigKind,
): Matrix2x2 {
  if (kind === "real") {
    const D: Matrix2x2 = [[lambda1.re, 0], [0, lambda2.re]];
    if (theta === 0) return D;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    if (Math.abs(st) < 1e-9) return D;
    const V: Matrix2x2 = [[1, ct], [0, st]];
    const Vinv: Matrix2x2 = [[1, -ct / st], [0, 1 / st]];
    return mul(mul(V, D), Vinv);
  }
  const a = lambda1.re;
  const b = Math.abs(lambda1.im);
  const R: Matrix2x2 = [[a, -b], [b, a]];
  if (theta === 0) return R;
  const tt = Math.tan(theta);
  const S: Matrix2x2 = [[1, 0], [tt, 1]];
  const Sinv: Matrix2x2 = [[1, 0], [-tt, 1]];
  return mul(mul(S, R), Sinv);
}

function mul(A: Matrix2x2, B: Matrix2x2): Matrix2x2 {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
}

export type Schur2x2 = {
  T: Matrix2x2;
  block: "real" | "complex";
  /** ‖off-diagonal of T‖_F — measures non-normality. */
  norm12: number;
};

/**
 * Compute the Schur form of a 2x2 real matrix W (up to similarity).
 * For real eigenvalues, T is upper-triangular with the eigenvalues on the diagonal
 * and the strictly-upper entry derived from the Frobenius identity.
 * For complex pair (a ± bi), T is the canonical real block [[a,-b],[b,a]];
 * we measure non-normality via the residual Frobenius norm.
 */
export function schur2x2(W: Matrix2x2): Schur2x2 {
  const e = eig2x2(W);
  const fro2 = W[0][0] ** 2 + W[0][1] ** 2 + W[1][0] ** 2 + W[1][1] ** 2;
  if (e.kind === "real") {
    const off2 = Math.max(0, fro2 - e.lambda1.re ** 2 - e.lambda2.re ** 2);
    const t12 = Math.sqrt(off2);
    return {
      T: [[e.lambda1.re, t12], [0, e.lambda2.re]],
      block: "real",
      norm12: t12,
    };
  }
  const a = e.lambda1.re;
  const b = Math.abs(e.lambda1.im);
  const off2 = Math.max(0, fro2 - 2 * (a * a + b * b));
  return {
    T: [[a, -b], [b, a]],
    block: "complex",
    norm12: Math.sqrt(off2),
  };
}
