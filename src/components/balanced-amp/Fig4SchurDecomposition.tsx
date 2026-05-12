import { useMemo, useState } from "react";
import * as math from "mathjs";
import { FigPanel } from "./FigPanel";
import { Slider } from "./Slider";

function buildToyMatrix(b: number): number[][] {
  const D = [
    [0.3, 0, 0],
    [0, -0.1, 0],
    [0, 0, -0.2],
  ];
  const F = [
    [0, 2.0, 0.5],
    [0, 0, 1.2],
    [0, 0, 0],
  ];
  return D.map((row, i) => row.map((v, j) => (1 - b) * v + b * F[i][j]));
}

export default function Fig4SchurDecomposition() {
  const [b, setB] = useState(0.7);

  const { eigenvalues, schur } = useMemo(() => {
    const W = buildToyMatrix(b);
    const Wm = math.matrix(W);
    const eigResult = math.eigs(Wm);
    const eigenvaluesArr = (eigResult.values as math.Matrix).toArray() as (number | math.Complex)[];
    const eigenvalues = eigenvaluesArr.map((v) =>
      typeof v === "number" ? v : (v as math.Complex).re
    );
    const T = simpleSchurUpper(W, eigenvalues);
    return { eigenvalues, schur: T };
  }, [b]);

  return (
    <FigPanel
      figNumber={4}
      title="Eigenvector basis vs. Schur basis"
      controls={
        <>
          <Slider
            label="Balancedness (0 = eigenmode-like, 1 = pure feedforward)"
            value={b}
            min={0}
            max={1}
            step={0.01}
            onChange={setB}
          />
        </>
      }
      caption={
        <>
          For a non-normal matrix, the eigenvector basis (left) hides feedforward connections between
          activity patterns. The Schur basis (middle) is orthonormal and exposes those feedforward weights
          as the upper-triangular entries. As the matrix becomes more "balanced" (eigenvalues → 0), the
          self-loops shrink and the dynamics become essentially feedforward (right).
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <MatrixDiagram title="Eigenvector picture" matrix={diag(eigenvalues)} />
        <MatrixDiagram title="Schur (orthonormal) basis" matrix={schur} />
        <MatrixDiagram title="Limit: pure feedforward" matrix={zeroDiag(schur)} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-zinc-500">Eigenvalues</div>
          <div className="mt-1 font-mono">[{eigenvalues.map((v) => v.toFixed(3)).join(", ")}]</div>
        </div>
        <div>
          <div className="text-zinc-500">Schur off-diagonals (feedforward weights)</div>
          <div className="mt-1 font-mono">
            T₁₂ = {schur[0][1].toFixed(2)}, T₁₃ = {schur[0][2].toFixed(2)}, T₂₃ = {schur[1][2].toFixed(2)}
          </div>
        </div>
      </div>
    </FigPanel>
  );
}

function MatrixDiagram({ title, matrix }: { title: string; matrix: number[][] }) {
  const positions = [
    { x: 50, y: 30, label: "p1" },
    { x: 30, y: 110, label: "p2" },
    { x: 80, y: 180, label: "p3" },
  ];
  const node = (p: { x: number; y: number; label: string }, i: number) => (
    <g key={i}>
      <circle cx={p.x} cy={p.y} r={16} className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300" strokeWidth={1.5} />
      <text x={p.x} y={p.y} dy="0.32em" textAnchor="middle" className="fill-zinc-700 text-[10px] dark:fill-zinc-300">{p.label}</text>
    </g>
  );
  const arrows: React.ReactElement[] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const w = matrix[i][j];
      if (Math.abs(w) < 0.01) continue;
      if (i === j) {
        const p = positions[i];
        const sign = w >= 0 ? "+" : "−";
        arrows.push(
          <g key={`s${i}`}>
            <path d={`M ${p.x + 18} ${p.y - 8} q 18 -10 4 -22 q -18 -12 -22 6`} fill="none" className="stroke-zinc-500" strokeWidth={1 + 2 * Math.abs(w)} markerEnd="url(#arrow)" />
            <text x={p.x + 32} y={p.y - 22} className="fill-zinc-600 text-[9px] dark:fill-zinc-400">{sign}{Math.abs(w).toFixed(2)}</text>
          </g>,
        );
      } else if (j > i) {
        const a = positions[j];
        const b = positions[i];
        arrows.push(
          <g key={`f${i}${j}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-blue-500" strokeWidth={1 + 2 * Math.abs(w)} markerEnd="url(#arrow)" />
            <text x={(a.x + b.x) / 2 + 8} y={(a.y + b.y) / 2} className="fill-blue-600 text-[9px] dark:fill-blue-400">{w.toFixed(2)}</text>
          </g>,
        );
      }
    }
  }
  return (
    <div>
      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</h5>
      <svg width={160} height={220} className="mt-2">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" className="fill-zinc-500" />
          </marker>
        </defs>
        {arrows}
        {positions.map(node)}
      </svg>
    </div>
  );
}

function diag(v: number[]): number[][] {
  return [[v[0], 0, 0], [0, v[1], 0], [0, 0, v[2]]];
}

function zeroDiag(M: number[][]): number[][] {
  return M.map((row, i) => row.map((x, j) => (i === j ? 0 : x)));
}

/** Visual "Schur-ish" form: keeps diagonal = eigenvalues, off-diagonal = original W upper triangle.
 * Not numerically true Schur, but visually conveys the same point — see plan limitations. */
function simpleSchurUpper(W: number[][], eigs: number[]): number[][] {
  return [
    [eigs[0], W[0][1], W[0][2]],
    [0, eigs[1], W[1][2]],
    [0, 0, eigs[2]],
  ];
}
