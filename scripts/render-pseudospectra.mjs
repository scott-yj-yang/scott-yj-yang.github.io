import { create, all } from "mathjs";
import sharp from "sharp";
import { resolve } from "path";

const math = create(all);

const W = 100;
const H = 100;
const RE = [-30, 30];
const IM = [-30, 30];
const N = 10;

const MATRICES = {
  "matrix-a": diagToeplitz(N, -2, 0.0),
  "matrix-b": diagToeplitz(N, -2, 0.7),
  "matrix-c": diagToeplitz(N, -2, 1.5),
};

function diagToeplitz(n, diag, upper) {
  const M = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(0);
    row[i] = diag;
    if (i + 1 < n) row[i + 1] = upper;
    M.push(row);
  }
  return M;
}

function sigmaMin(zRe, zIm, M) {
  const n = M.length;
  // A = zI - M (complex). Real embedding into 2n x 2n.
  const big = math.zeros(2 * n, 2 * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const reA = (i === j ? zRe : 0) - M[i][j];
      const imA = (i === j ? zIm : 0);
      big.set([i, j], reA);
      big.set([i, j + n], -imA);
      big.set([i + n, j], imA);
      big.set([i + n, j + n], reA);
    }
  }
  const MtM = math.multiply(math.transpose(big), big);
  const { values } = math.eigs(MtM);
  let min = Infinity;
  const arr = values.toArray();
  for (const v of arr) {
    const ab = typeof v === "number" ? Math.abs(v) : Math.abs(v.re);
    if (ab < min) min = ab;
  }
  return Math.sqrt(min);
}

// Map log10(eps) in [-4, 1] to an RGB ramp from light pink (small eps) to dark red (large eps).
function colorRamp(eps) {
  const t = Math.max(0, Math.min(1, (Math.log10(eps + 1e-15) + 4) / 5));
  const r = Math.round(255 - 100 * (1 - t));
  const g = Math.round(120 * (1 - t));
  const b = Math.round(120 * (1 - t));
  return [r, g, b];
}

async function render(name, M) {
  console.log(`Rendering ${name}...`);
  const buf = Buffer.alloc(W * H * 4);
  for (let py = 0; py < H; py++) {
    const im = IM[1] - (py / (H - 1)) * (IM[1] - IM[0]);
    for (let px = 0; px < W; px++) {
      const re = RE[0] + (px / (W - 1)) * (RE[1] - RE[0]);
      let sigma;
      try {
        sigma = sigmaMin(re, im, M);
      } catch (e) {
        sigma = 1e-10;
      }
      const [r, g, b] = colorRamp(sigma);
      const idx = 4 * (py * W + px);
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    }
    if (py % 10 === 0) console.log(`  row ${py}/${H}`);
  }
  const out = resolve(`public/eigen/pseudospectra/${name}.png`);
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
  console.log(`  -> ${out}`);
}

const t0 = Date.now();
for (const [name, M] of Object.entries(MATRICES)) await render(name, M);
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
