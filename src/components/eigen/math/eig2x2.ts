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
