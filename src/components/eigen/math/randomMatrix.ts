export type SampleSpec =
  | { mode: "iid"; N: number; sigma: number; seed: number }
  | { mode: "symmetric"; N: number; sigma: number; seed: number }
  | { mode: "elliptic"; N: number; sigma: number; rho: number; seed: number }
  | { mode: "ei"; N: number; sigma: number; f: number; muE: number; muI: number; seed: number }
  | { mode: "multipop"; N: number; alpha: number; sigmaE: number; sigmaI: number; seed: number };

/** Mulberry32 PRNG — deterministic, fast, good enough for visual sampling. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller draw of one standard normal sample. */
function gaussian(rng: () => number): number {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function sample(spec: SampleSpec): number[][] {
  const rng = mulberry32(spec.seed);
  const N = spec.N;
  const M: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));

  if (spec.mode === "iid") {
    const s = spec.sigma / Math.sqrt(N);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        M[i][j] = s * gaussian(rng);
    return M;
  }

  if (spec.mode === "symmetric") {
    const s = spec.sigma / Math.sqrt(N);
    for (let i = 0; i < N; i++)
      for (let j = i; j < N; j++) {
        const v = s * gaussian(rng);
        M[i][j] = v;
        M[j][i] = v;
      }
    return M;
  }

  if (spec.mode === "elliptic") {
    const s = spec.sigma / Math.sqrt(N);
    const r = spec.rho;
    for (let i = 0; i < N; i++) {
      M[i][i] = s * gaussian(rng);
      for (let j = i + 1; j < N; j++) {
        const a = gaussian(rng);
        const b = gaussian(rng);
        M[i][j] = s * a;
        M[j][i] = s * (r * a + Math.sqrt(Math.max(0, 1 - r * r)) * b);
      }
    }
    return M;
  }

  if (spec.mode === "ei") {
    const s = spec.sigma / Math.sqrt(N);
    const splitCol = Math.floor(spec.f * N);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const mu = (j < splitCol ? spec.muE : spec.muI) / Math.sqrt(N);
        M[i][j] = mu + s * gaussian(rng);
      }
    return M;
  }

  // multipop
  const splitCol = Math.floor(spec.alpha * N);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const sigma = j < splitCol ? spec.sigmaE : spec.sigmaI;
      M[i][j] = (sigma / Math.sqrt(N)) * gaussian(rng);
    }
  return M;
}
