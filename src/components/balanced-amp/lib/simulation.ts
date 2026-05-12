export interface SimulationParams {
  /** N x N connectivity matrix (row-major nested arrays). */
  W: number[][];
  /** Initial state, length N. */
  r0: number[];
  /** External input as a function of time (returns length-N vector). */
  input: (t: number) => number[];
  /** Membrane time constant. */
  tau: number;
  /** Integration step. */
  dt: number;
  /** End time. */
  tEnd: number;
}

export interface Trajectory {
  /** Time points, length T+1. */
  t: number[];
  /** State at each time point, length T+1 of length-N vectors. */
  r: number[][];
}

/** RK4 integration of tau * dr/dt = -r + W r + I(t). */
export function simulateLinearRK4(params: SimulationParams): Trajectory {
  const { W, r0, input, tau, dt, tEnd } = params;
  const N = r0.length;
  const steps = Math.max(1, Math.ceil(tEnd / dt));

  const t: number[] = new Array(steps + 1);
  const r: number[][] = new Array(steps + 1);
  t[0] = 0;
  r[0] = r0.slice();

  for (let i = 0; i < steps; i++) {
    const ti = t[i];
    const ri = r[i];
    const k1 = deriv(ri, ti, W, input, tau, N);
    const k2 = deriv(addScaled(ri, k1, dt / 2), ti + dt / 2, W, input, tau, N);
    const k3 = deriv(addScaled(ri, k2, dt / 2), ti + dt / 2, W, input, tau, N);
    const k4 = deriv(addScaled(ri, k3, dt), ti + dt, W, input, tau, N);
    const next = new Array(N);
    for (let j = 0; j < N; j++) {
      next[j] = ri[j] + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]);
    }
    t[i + 1] = ti + dt;
    r[i + 1] = next;
  }
  return { t, r };
}

function deriv(r: number[], t: number, W: number[][], input: (t: number) => number[], tau: number, N: number): number[] {
  const I = input(t);
  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    let wr = 0;
    for (let j = 0; j < N; j++) wr += W[i][j] * r[j];
    out[i] = (-r[i] + wr + I[i]) / tau;
  }
  return out;
}

function addScaled(a: number[], b: number[], s: number): number[] {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + s * b[i];
  return out;
}

/** For pulse inputs: returns the value at t=0 only; zero elsewhere. */
export function deltaPulse(amp: number[], width = 0.001): (t: number) => number[] {
  return (t: number) => (t < width ? amp.map((a) => a / width) : amp.map(() => 0));
}

/** Step / sustained input starting at t=0. */
export function sustainedInput(amp: number[]): (t: number) => number[] {
  return () => amp;
}
