export type Mat2 = [[number, number], [number, number]];
export type Vec2 = [number, number];

/** Eigenvalues + eigenvectors of a 2x2 real matrix. Real eigenvalues only;
 * for complex eigenvalues, returns NaN. */
export function eig2x2(W: Mat2): { eigenvalues: [number, number]; eigenvectors: [Vec2, Vec2] } {
  const [[a, b], [c, d]] = W;
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr / 4 - det;
  if (disc < 0) {
    return { eigenvalues: [NaN, NaN], eigenvectors: [[NaN, NaN], [NaN, NaN]] };
  }
  const sqrtDisc = Math.sqrt(disc);
  const lambdas: [number, number] = [tr / 2 + sqrtDisc, tr / 2 - sqrtDisc];
  const eigvec = (lambda: number): Vec2 => {
    if (Math.abs(b) > 1e-12) return normalize([b, lambda - a]);
    if (Math.abs(c) > 1e-12) return normalize([lambda - d, c]);
    return Math.abs(a - lambda) < 1e-12 ? [1, 0] : [0, 1];
  };
  return { eigenvalues: lambdas, eigenvectors: [eigvec(lambdas[0]), eigvec(lambdas[1])] };
}

export function applyW2(W: Mat2, r: Vec2): Vec2 {
  return [W[0][0] * r[0] + W[0][1] * r[1], W[1][0] * r[0] + W[1][1] * r[1]];
}

export function computeSumDiff(rE: number, rI: number): { sum: number; diff: number } {
  return { sum: 0.5 * (rE + rI), diff: 0.5 * (rE - rI) };
}

function normalize(v: Vec2): Vec2 {
  const n = Math.hypot(v[0], v[1]);
  return n < 1e-12 ? [0, 0] : [v[0] / n, v[1] / n];
}
