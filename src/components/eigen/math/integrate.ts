import type { Matrix2x2 } from "./eig2x2";

export type IntegrateOpts = { dt: number; steps: number };

/**
 * Forward Euler integration of dx/dt = W x for a 2D linear system.
 * Returns a length-(steps+1) array including the initial condition at index 0.
 */
export function integrate2x2(
  W: Matrix2x2,
  x0: [number, number],
  opts: IntegrateOpts,
): [number, number][] {
  const out: [number, number][] = new Array(opts.steps + 1);
  out[0] = [x0[0], x0[1]];
  let x = x0[0];
  let y = x0[1];
  for (let i = 0; i < opts.steps; i++) {
    const dx = W[0][0] * x + W[0][1] * y;
    const dy = W[1][0] * x + W[1][1] * y;
    x += opts.dt * dx;
    y += opts.dt * dy;
    out[i + 1] = [x, y];
  }
  return out;
}
