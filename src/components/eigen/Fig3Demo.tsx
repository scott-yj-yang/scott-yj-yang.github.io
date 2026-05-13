import { useEffect, useMemo, useState } from "react";
import ComplexPlane from "./plots/ComplexPlane";
import Trajectory from "./plots/Trajectory";
import { encodeFig3, decodeFig3, readQuery, writeQuery } from "./math/urlState";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function modeTrajectory(eigs: number[], dt: number, steps: number, seed: number) {
  const rng = seededRng(seed);
  const w = eigs.map(() => rng() * 0.5 + 0.5);
  const ys = new Array<number>(steps + 1);
  for (let k = 0; k <= steps; k++) {
    const t = k * dt;
    let s = 0;
    for (let i = 0; i < eigs.length; i++) s += w[i] * Math.exp(eigs[i] * t);
    ys[k] = s;
  }
  return ys;
}

function StableBadge({ stable }: { stable: boolean }) {
  return (
    <span
      className={`ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
        stable
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
      }`}
    >
      {stable ? "stable" : "unstable"}
    </span>
  );
}

function Panel3A({ shift, setShift }: { shift: number; setShift: (v: number) => void }) {
  const eigs = useMemo(() => {
    const rng = seededRng(1);
    return Array.from({ length: 30 }, () => shift + (rng() - 0.5) * 2);
  }, [shift]);
  const stable = eigs.every((e) => e < 0);
  const y = useMemo(() => modeTrajectory(eigs, 0.02, 500, 11), [eigs]);
  return (
    <div className="not-prose rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">3A · Stability</div>
      <p className="mt-1 text-[10px] leading-snug text-zinc-500">
        30 eigenvalues drawn around a mean μ. The network is stable iff <em>all</em> eigenvalues sit
        left of the dashed line (Re(λ)&nbsp;=&nbsp;0). Drag μ to flip stability.
      </p>
      <ComplexPlane
        width={220}
        height={150}
        reRange={[-6, 6]}
        imRange={[-1, 1]}
        points={eigs.map((re, i) => ({
          id: `e${i}`,
          re,
          im: 0,
          color: re > 0 ? "rgb(244,63,94)" : "rgb(124,58,237)",
        }))}
      />
      <input
        type="range"
        min={-5}
        max={5}
        step={0.1}
        value={shift}
        onChange={(e) => setShift(parseFloat(e.target.value))}
        className="mt-2 w-full"
      />
      <div className="flex items-center text-xs">
        <span className="text-zinc-500">cluster mean μ =</span>
        <span className="ml-1 font-mono">{shift.toFixed(2)}</span>
        <StableBadge stable={stable} />
      </div>
      <Trajectory
        width={220}
        height={130}
        dt={0.02}
        series={[{ values: y, color: "rgb(124,58,237)", label: "response Σᵢ wᵢ e^(λᵢ t)" }]}
        title="Network response"
        xLabel="time t"
        yLabel="x(t)"
      />
    </div>
  );
}

function Panel3B({
  mu1,
  setMu1,
  mu2,
  setMu2,
}: {
  mu1: number;
  setMu1: (v: number) => void;
  mu2: number;
  setMu2: (v: number) => void;
}) {
  const eigs = useMemo(() => {
    const rng = seededRng(2);
    return [
      ...Array.from({ length: 15 }, () => mu1 + (rng() - 0.5) * 0.4),
      ...Array.from({ length: 15 }, () => mu2 + (rng() - 0.5) * 0.4),
    ];
  }, [mu1, mu2]);
  const y = useMemo(() => modeTrajectory(eigs, 0.02, 500, 13), [eigs]);
  const tauSlow = Math.abs(1 / Math.max(mu1, mu2));
  const tauFast = Math.abs(1 / Math.min(mu1, mu2));
  return (
    <div className="not-prose rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">3B · Two timescales</div>
      <p className="mt-1 text-[10px] leading-snug text-zinc-500">
        Two eigenvalue clusters at μ₁ and μ₂ produce two decay timescales:
        a fast one (~{tauFast.toFixed(2)}) and a slow one (~{tauSlow.toFixed(2)}).
        The response is a sum of fast + slow exponentials.
      </p>
      <ComplexPlane
        width={220}
        height={150}
        reRange={[-6, 6]}
        imRange={[-1, 1]}
        points={eigs.map((re, i) => ({ id: `e${i}`, re, im: 0, color: "rgb(124,58,237)" }))}
      />
      <div className="mt-2 text-xs text-zinc-500">μ₁ = <span className="font-mono text-zinc-800 dark:text-zinc-200">{mu1.toFixed(2)}</span></div>
      <input
        type="range"
        min={-5}
        max={0}
        step={0.1}
        value={mu1}
        onChange={(e) => setMu1(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="text-xs text-zinc-500">μ₂ = <span className="font-mono text-zinc-800 dark:text-zinc-200">{mu2.toFixed(2)}</span></div>
      <input
        type="range"
        min={-5}
        max={0}
        step={0.1}
        value={mu2}
        onChange={(e) => setMu2(parseFloat(e.target.value))}
        className="w-full"
      />
      <Trajectory
        width={220}
        height={130}
        dt={0.02}
        series={[{ values: y, color: "rgb(124,58,237)", label: "response Σᵢ wᵢ e^(λᵢ t)" }]}
        title="Network response"
        xLabel="time t"
        yLabel="x(t)"
      />
    </div>
  );
}

function Panel3C({ outlier, setOutlier }: { outlier: number; setOutlier: (v: number) => void }) {
  const eigs = useMemo(() => {
    const rng = seededRng(3);
    return [
      ...Array.from({ length: 29 }, () => -5 + (rng() - 0.5) * 0.6),
      outlier,
    ];
  }, [outlier]);
  const stable = outlier < 0;
  const y = useMemo(() => modeTrajectory(eigs, 0.02, 500, 17), [eigs]);
  return (
    <div className="not-prose rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">3C · Dominant direction</div>
      <p className="mt-1 text-[10px] leading-snug text-zinc-500">
        29 fast-decaying eigenvalues at μ ≈ −5, plus one <span className="text-rose-600 dark:text-rose-400">red outlier</span>.
        At late times the response is dominated by the slowest mode (the outlier). Drag the outlier across 0 to flip stability.
      </p>
      <ComplexPlane
        width={220}
        height={150}
        reRange={[-6, 6]}
        imRange={[-1, 1]}
        points={eigs.map((re, i) => ({
          id: `e${i}`,
          re,
          im: 0,
          color: i === eigs.length - 1 ? "rgb(244,63,94)" : "rgb(124,58,237)",
        }))}
      />
      <input
        type="range"
        min={-5}
        max={1}
        step={0.05}
        value={outlier}
        onChange={(e) => setOutlier(parseFloat(e.target.value))}
        className="mt-2 w-full"
      />
      <div className="flex items-center text-xs">
        <span className="text-zinc-500">outlier λ =</span>
        <span className="ml-1 font-mono">{outlier.toFixed(2)}</span>
        <StableBadge stable={stable} />
      </div>
      <Trajectory
        width={220}
        height={130}
        dt={0.02}
        series={[{ values: y, color: "rgb(244,63,94)", label: "dominated by outlier mode" }]}
        title="Network response"
        xLabel="time t"
        yLabel="x(t)"
      />
    </div>
  );
}

function ShareButton() {
  return (
    <button
      type="button"
      className="text-xs underline text-zinc-500"
      onClick={() => navigator.clipboard.writeText(window.location.href)}
    >
      copy share link
    </button>
  );
}

export default function Fig3Demo() {
  const [shift, setShift] = useState(-2);
  const [mu1, setMu1] = useState(-3);
  const [mu2, setMu2] = useState(-0.3);
  const [outlier, setOutlier] = useState(-1);

  useEffect(() => {
    const u = decodeFig3(readQuery("fig3"));
    if (u) {
      setShift(u.shift);
      setMu1(u.mu1);
      setMu2(u.mu2);
      setOutlier(u.outlier);
    }
  }, []);

  useEffect(() => {
    writeQuery("fig3", encodeFig3({ shift, mu1, mu2, outlier }));
  }, [shift, mu1, mu2, outlier]);

  return (
    <div>
      <p className="mb-3 text-xs text-zinc-500">
        Each panel uses the spectrum of <em>M</em> = <em>W − I</em>. Eigenvalues sit on the complex plane (top of each panel);
        the trajectory below is a random mixture of modes <span className="font-mono">Σᵢ wᵢ e^(λᵢ t)</span>.
      </p>
      <div className="my-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Panel3A shift={shift} setShift={setShift} />
        <Panel3B mu1={mu1} setMu1={setMu1} mu2={mu2} setMu2={setMu2} />
        <Panel3C outlier={outlier} setOutlier={setOutlier} />
      </div>
      <ShareButton />
    </div>
  );
}
