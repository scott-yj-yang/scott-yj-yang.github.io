import { useMemo, useState } from "react";
import ComplexPlane from "./plots/ComplexPlane";
import Trajectory from "./plots/Trajectory";
import VectorField from "./plots/VectorField";
import MatrixReadout from "./plots/MatrixReadout";
import { matrixFromEigenvalues, type Matrix2x2 } from "./math/eig2x2";
import { integrate2x2 } from "./math/integrate";
import { symmetricPart, eigSymmetric2x2 } from "./math/symmetricPart";

type Mode = "real" | "complex";
type State = {
  mode: Mode;
  lambda1: { re: number; im: number };
  lambda2: { re: number; im: number };
  theta: number;
  r0: [number, number];
};

const DEFAULT: State = {
  mode: "real",
  lambda1: { re: 0.4, im: 0 },
  lambda2: { re: -0.7, im: 0 },
  theta: 1.0,
  r0: [1, 0],
};

export default function BondanelliDemo() {
  const [state, setState] = useState<State>(DEFAULT);

  // J from eigenvalue + skew (same machinery Fig 2/4 use)
  const J = useMemo(
    () => matrixFromEigenvalues(state.lambda1, state.lambda2, state.theta, state.mode),
    [state],
  );
  // M = J - I — the actual dynamics matrix for dr/dt = -r + Jr
  const M: Matrix2x2 = useMemo(
    () => [
      [J[0][0] - 1, J[0][1]],
      [J[1][0], J[1][1] - 1],
    ],
    [J],
  );
  const Js = useMemo(() => symmetricPart(J), [J]);
  const { eigenvalues: jsEigs, eigenvectors: jsVecs } = useMemo(() => eigSymmetric2x2(Js), [Js]);
  const [lMax, lMin] = jsEigs;
  const [vMax] = jsVecs;
  const amplifying = lMax > 1;

  const traj = useMemo(
    () => integrate2x2(M, state.r0, { dt: 0.05, steps: 400 }),
    [M, state.r0],
  );
  const norms = traj.map(([x, y]) => Math.hypot(x, y));
  const peakNorm = Math.max(...norms);
  const peakIdx = norms.indexOf(peakNorm);
  const initialNorm = Math.hypot(state.r0[0], state.r0[1]) || 1;
  const amplification = peakNorm / initialNorm;

  function onDragJSpectrum(id: string, next: { re: number; im: number }) {
    setState((s) => {
      const re = Math.max(-2, Math.min(2, next.re));
      if (s.mode === "real") {
        return id === "l1"
          ? { ...s, lambda1: { re, im: 0 } }
          : { ...s, lambda2: { re, im: 0 } };
      }
      const im = Math.max(-2, Math.min(2, next.im));
      return {
        ...s,
        lambda1: { re, im: Math.abs(im) },
        lambda2: { re, im: -Math.abs(im) },
      };
    });
  }

  function snapToOptimal() {
    setState((s) => ({ ...s, r0: [vMax[0], vMax[1]] }));
  }

  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
      {/* Top-left: Spectrum of J */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Spectrum of J (drag)</div>
        <ComplexPlane
          width={280} height={220}
          reRange={[-2, 2]} imRange={[-2, 2]}
          points={[
            { id: "l1", re: state.lambda1.re, im: state.lambda1.im, color: "rgb(59,130,246)", draggable: true },
            { id: "l2", re: state.lambda2.re, im: state.lambda2.im, color: "rgb(59,130,246)", draggable: state.mode === "real" },
          ]}
          onDrag={onDragJSpectrum}
        />
        <div className="flex gap-2 mt-2 text-xs flex-wrap">
          <button
            className={`px-2 py-1 rounded border ${state.mode === "real" ? "bg-accent text-white" : "border-zinc-300"}`}
            onClick={() => setState((s) => ({ ...s, mode: "real",
              lambda1: { re: s.lambda1.re, im: 0 }, lambda2: { re: s.lambda2.re, im: 0 } }))}>real</button>
          <button
            className={`px-2 py-1 rounded border ${state.mode === "complex" ? "bg-accent text-white" : "border-zinc-300"}`}
            onClick={() => setState((s) => ({ ...s, mode: "complex",
              lambda1: { re: s.lambda1.re, im: 0.5 }, lambda2: { re: s.lambda1.re, im: -0.5 } }))}>complex</button>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          eigenvector skew θ = {state.theta.toFixed(2)} rad
        </div>
        <input type="range" min={0} max={1.5} step={0.01} value={state.theta}
          onChange={(e) => setState((s) => ({ ...s, theta: parseFloat(e.target.value) }))}
          className="w-full"/>
        <MatrixReadout W={J} caption="J" />
      </div>

      {/* Top-right: Spectrum of J_S */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Spectrum of J_S = (J + Jᵀ) / 2</div>
        <ComplexPlane
          width={280} height={220}
          reRange={[-2, 2]} imRange={[-1, 1]}
          showStabilityLine={false}
          points={[
            { id: "smax", re: lMax, im: 0, color: "rgb(244,63,94)" },
            { id: "smin", re: lMin, im: 0, color: "rgb(244,63,94)" },
          ]}
        />
        <div className="mt-2 text-xs">
          λ_max(J_S) = <span className="font-mono">{lMax.toFixed(3)}</span>
          <br />
          {amplifying ? (
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              Amplifying  (λ_max(J_S) &gt; 1)
            </span>
          ) : (
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Monotonic decay  (λ_max(J_S) ≤ 1)
            </span>
          )}
        </div>
      </div>

      {/* Bottom-left: r_0 picker */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Initial condition r₀ (drag)</div>
        <VectorField
          W={M}
          x0={state.r0}
          trajectory={traj}
          onDragX0={(next) => setState((s) => ({ ...s, r0: next }))}
          width={280} height={220} range={[-2, 2]}
        />
        <button
          type="button"
          className="mt-2 px-2 py-1 rounded bg-accent text-white text-xs"
          onClick={snapToOptimal}
          disabled={!amplifying}
        >
          Snap r₀ to top eigenvector of J_S
        </button>
        <div className="text-xs text-zinc-500 mt-1">optimal r₀ ≈ ({vMax[0].toFixed(2)}, {vMax[1].toFixed(2)})</div>
      </div>

      {/* Bottom-right: ‖r(t)‖ */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">‖r(t)‖ over time</div>
        <Trajectory
          dt={0.05}
          width={280} height={180}
          series={[{ values: norms, color: "rgb(244,63,94)" }]}
        />
        <div className="text-xs text-zinc-500 mt-1">
          peak amplification = <span className="font-mono">{amplification.toFixed(2)}×</span> at t ≈ {(peakIdx * 0.05).toFixed(1)}
        </div>
      </div>
    </div>
  );
}
