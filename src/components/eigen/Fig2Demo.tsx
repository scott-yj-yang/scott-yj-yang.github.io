import { useEffect, useMemo, useState } from "react";
import ComplexPlane from "./plots/ComplexPlane";
import Trajectory from "./plots/Trajectory";
import VectorField from "./plots/VectorField";
import MatrixReadout from "./plots/MatrixReadout";
import { eig2x2, matrixFromEigenvalues, type Matrix2x2 } from "./math/eig2x2";
import { integrate2x2 } from "./math/integrate";
import { decodeFig2, encodeFig2, readQuery, writeQuery, type Fig2State } from "./math/urlState";

type Preset = { label: string; W: Matrix2x2 };

const PRESETS: Preset[] = [
  { label: "A", W: [[-10, 0], [0, -2]] },
  { label: "B", W: [[2, 0], [0, 4]] },
  { label: "C", W: [[1, -8], [2, -3]] },
  { label: "D", W: [[5, -2], [10, -1]] },
];

const DEFAULT: Fig2State = {
  mode: "real",
  lambda1: { re: -10, im: 0 },
  lambda2: { re: -2, im: 0 },
  theta: 0,
  x0: [1, 1],
};

export default function Fig2Demo() {
  const [state, setState] = useState<Fig2State>(DEFAULT);

  useEffect(() => {
    const fromUrl = decodeFig2(readQuery("fig2"));
    if (fromUrl) setState(fromUrl);
  }, []);

  useEffect(() => {
    writeQuery("fig2", encodeFig2(state));
  }, [state]);

  const W = useMemo(
    () => matrixFromEigenvalues(state.lambda1, state.lambda2, state.theta, state.mode),
    [state],
  );
  const traj = useMemo(
    () => integrate2x2(W, state.x0, { dt: 0.05, steps: 400 }),
    [W, state.x0],
  );
  const x1 = traj.map((p) => p[0]);
  const x2 = traj.map((p) => p[1]);

  function applyPreset(W: Matrix2x2) {
    const e = eig2x2(W);
    setState((s) => ({ ...s, mode: e.kind, lambda1: e.lambda1, lambda2: e.lambda2, theta: 0 }));
  }

  function onDragSpectrum(id: string, next: { re: number; im: number }) {
    setState((s) => {
      const re = Math.max(-15, Math.min(15, next.re));
      if (s.mode === "real") {
        return id === "l1"
          ? { ...s, lambda1: { re, im: 0 } }
          : { ...s, lambda2: { re, im: 0 } };
      }
      const im = Math.max(-15, Math.min(15, next.im));
      return {
        ...s,
        lambda1: { re, im: Math.abs(im) },
        lambda2: { re, im: -Math.abs(im) },
      };
    });
  }

  function setMode(mode: "real" | "complex") {
    setState((s) => {
      if (mode === "real") {
        return { ...s, mode, lambda1: { re: s.lambda1.re, im: 0 }, lambda2: { re: s.lambda2.re, im: 0 } };
      }
      return {
        ...s, mode,
        lambda1: { re: s.lambda1.re, im: 2 },
        lambda2: { re: s.lambda1.re, im: -2 },
      };
    });
  }

  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Spectrum (drag)</div>
        <ComplexPlane
          points={[
            { id: "l1", re: state.lambda1.re, im: state.lambda1.im, color: "rgb(124,58,237)", draggable: true },
            { id: "l2", re: state.lambda2.re, im: state.lambda2.im, color: "rgb(124,58,237)", draggable: state.mode === "real" },
          ]}
          onDrag={onDragSpectrum}
        />
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <button
            className={`px-2 py-1 rounded border ${state.mode === "real" ? "bg-accent text-white" : "border-zinc-300"}`}
            onClick={() => setMode("real")}
          >real</button>
          <button
            className={`px-2 py-1 rounded border ${state.mode === "complex" ? "bg-accent text-white" : "border-zinc-300"}`}
            onClick={() => setMode("complex")}
          >complex</button>
          <span className="mx-2 text-zinc-400">presets:</span>
          {PRESETS.map((p) => (
            <button key={p.label} className="px-2 py-1 rounded border border-zinc-300" onClick={() => applyPreset(p.W)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">W = V Λ V⁻¹</div>
        <MatrixReadout W={W} caption="W" />
        <div className="mt-3 text-xs font-mono text-zinc-500">
          λ₁ = {fmtComplex(state.lambda1)}<br />
          λ₂ = {fmtComplex(state.lambda2)}
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Trajectories x(t)</div>
        <Trajectory
          dt={0.05}
          series={[
            { values: x1, color: "rgb(124,58,237)", label: "x₁" },
            { values: x2, color: "rgb(6,182,212)", label: "x₂" },
          ]}
        />
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Phase plane (drag x₀)</div>
        <VectorField
          W={W}
          x0={state.x0}
          trajectory={traj}
          onDragX0={(next) => setState((s) => ({ ...s, x0: next }))}
        />
      </div>
    </div>
  );
}

function fmtComplex(c: { re: number; im: number }) {
  if (Math.abs(c.im) < 1e-9) return c.re.toFixed(2);
  const sign = c.im >= 0 ? "+" : "−";
  return `${c.re.toFixed(2)} ${sign} ${Math.abs(c.im).toFixed(2)}i`;
}
