import { useMemo, useState } from "react";
import ComplexPlane from "./plots/ComplexPlane";
import Trajectory from "./plots/Trajectory";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
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

function Panel3A() {
  const [shift, setShift] = useState(-2);
  const eigs = useMemo(() => {
    const rng = seededRng(1);
    return Array.from({ length: 30 }, () => shift + (rng() - 0.5) * 2);
  }, [shift]);
  const y = useMemo(() => modeTrajectory(eigs, 0.02, 500, 11), [eigs]);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 not-prose">
      <div className="text-xs font-semibold text-zinc-500 mb-1">3A · Stability</div>
      <ComplexPlane width={220} height={160} reRange={[-6, 6]} imRange={[-1, 1]}
        points={eigs.map((re, i) => ({ id: `e${i}`, re, im: 0, color: re > 0 ? "rgb(244,63,94)" : "rgb(124,58,237)" }))}/>
      <input type="range" min={-5} max={5} step={0.1} value={shift}
        onChange={(e) => setShift(parseFloat(e.target.value))}
        className="w-full mt-2"/>
      <div className="text-xs text-zinc-500">cluster mean μ = {shift.toFixed(2)}</div>
      <Trajectory width={220} height={120} dt={0.02}
        series={[{ values: y, color: "rgb(124,58,237)" }]}/>
    </div>
  );
}

function Panel3B() {
  const [mu1, setMu1] = useState(-3);
  const [mu2, setMu2] = useState(-0.3);
  const eigs = useMemo(() => {
    const rng = seededRng(2);
    return [
      ...Array.from({ length: 15 }, () => mu1 + (rng() - 0.5) * 0.4),
      ...Array.from({ length: 15 }, () => mu2 + (rng() - 0.5) * 0.4),
    ];
  }, [mu1, mu2]);
  const y = useMemo(() => modeTrajectory(eigs, 0.02, 500, 13), [eigs]);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 not-prose">
      <div className="text-xs font-semibold text-zinc-500 mb-1">3B · Two timescales</div>
      <ComplexPlane width={220} height={160} reRange={[-6, 6]} imRange={[-1, 1]}
        points={eigs.map((re, i) => ({ id: `e${i}`, re, im: 0, color: "rgb(124,58,237)" }))}/>
      <div className="text-xs text-zinc-500 mt-2">μ₁ = {mu1.toFixed(2)}</div>
      <input type="range" min={-5} max={0} step={0.1} value={mu1}
        onChange={(e) => setMu1(parseFloat(e.target.value))} className="w-full"/>
      <div className="text-xs text-zinc-500">μ₂ = {mu2.toFixed(2)}</div>
      <input type="range" min={-5} max={0} step={0.1} value={mu2}
        onChange={(e) => setMu2(parseFloat(e.target.value))} className="w-full"/>
      <Trajectory width={220} height={120} dt={0.02}
        series={[{ values: y, color: "rgb(124,58,237)" }]}/>
    </div>
  );
}

function Panel3C() {
  const [outlier, setOutlier] = useState(-1);
  const eigs = useMemo(() => {
    const rng = seededRng(3);
    return [
      ...Array.from({ length: 29 }, () => -5 + (rng() - 0.5) * 0.6),
      outlier,
    ];
  }, [outlier]);
  const y = useMemo(() => modeTrajectory(eigs, 0.02, 500, 17), [eigs]);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 not-prose">
      <div className="text-xs font-semibold text-zinc-500 mb-1">3C · Dominant direction</div>
      <ComplexPlane width={220} height={160} reRange={[-6, 6]} imRange={[-1, 1]}
        points={eigs.map((re, i) => ({ id: `e${i}`, re, im: 0,
          color: i === eigs.length - 1 ? "rgb(244,63,94)" : "rgb(124,58,237)" }))}/>
      <input type="range" min={-5} max={1} step={0.05} value={outlier}
        onChange={(e) => setOutlier(parseFloat(e.target.value))} className="w-full mt-2"/>
      <div className="text-xs text-zinc-500">outlier λ = {outlier.toFixed(2)}</div>
      <Trajectory width={220} height={120} dt={0.02}
        series={[{ values: y, color: "rgb(244,63,94)" }]}/>
    </div>
  );
}

export default function Fig3Demo() {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-3">
      <Panel3A />
      <Panel3B />
      <Panel3C />
    </div>
  );
}
