import { useEffect, useMemo, useState } from "react";
import ComplexPlane from "./plots/ComplexPlane";
import Trajectory from "./plots/Trajectory";
import MatrixReadout from "./plots/MatrixReadout";
import { matrixFromEigenvalues, schur2x2 } from "./math/eig2x2";
import { integrate2x2 } from "./math/integrate";
import { encodeFig4, decodeFig4, readQuery, writeQuery } from "./math/urlState";

const PSEUDO = [
  { id: "matrix-a", label: "A · low non-normality", src: "/eigen/pseudospectra/matrix-a.png" },
  { id: "matrix-b", label: "B · medium non-normality", src: "/eigen/pseudospectra/matrix-b.png" },
  { id: "matrix-c", label: "C · high non-normality", src: "/eigen/pseudospectra/matrix-c.png" },
];

function PanelTransient({ theta, setTheta }: { theta: number; setTheta: (v: number) => void }) {
  const lambda1 = { re: -1, im: 0 };
  const lambda2 = { re: -2, im: 0 };
  const W = useMemo(
    () => matrixFromEigenvalues(lambda1, lambda2, theta, "real"),
    [theta],
  );
  const traj = useMemo(() => integrate2x2(W, [1, -1], { dt: 0.01, steps: 2000 }), [W]);
  const norms = traj.map(([x, y]) => Math.hypot(x, y));
  const schur = schur2x2(W);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose">
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-1">Eigenvalues fixed at −1, −2</div>
        <ComplexPlane width={220} height={180}
          reRange={[-3, 1]} imRange={[-2, 2]}
          points={[
            { re: -1, im: 0, color: "rgb(124,58,237)" },
            { re: -2, im: 0, color: "rgb(124,58,237)" },
          ]}/>
        <label className="text-xs text-zinc-500 block mt-2">eigenvector skew θ = {theta.toFixed(2)} rad</label>
        <input type="range" min={0} max={1.5} step={0.01} value={theta}
          onChange={(e) => setTheta(parseFloat(e.target.value))} className="w-full"/>
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-1">W (becomes non-normal)</div>
        <MatrixReadout W={W} highlight="off-diagonal" caption="W"/>
        <div className="mt-2 text-xs text-zinc-500">‖off-diagonal of Schur T‖ = {schur.norm12.toFixed(3)}</div>
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-1">‖x(t)‖ over time</div>
        <Trajectory dt={0.01} width={240} height={180}
          series={[{ values: norms, color: "rgb(244,63,94)" }]}/>
        <div className="text-xs text-zinc-500 mt-1">As θ grows the norm spikes before decaying.</div>
      </div>
    </div>
  );
}

function PanelSchur() {
  const W: [[number, number], [number, number]] = [[1, -8], [2, -3]];
  const schur = schur2x2(W);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 not-prose mt-4">
      <div className="text-xs font-semibold text-zinc-500 mb-1">Schur form T (upper triangular)</div>
      <div className="flex items-center gap-6 flex-wrap">
        <MatrixReadout W={W} caption="W (Fig 2C example)"/>
        <span className="text-zinc-400">→</span>
        <MatrixReadout W={schur.T} highlight="lower-tri" caption="T = U* W U"/>
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        Diagonal entries are the eigenvalues; the off-diagonal block carries the
        feed-forward coupling that creates transient amplification.
      </div>
    </div>
  );
}

function PanelPseudo({ pick, setPick }: { pick: string; setPick: (v: string) => void }) {
  const cur = PSEUDO.find((p) => p.id === pick)!;
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 not-prose mt-4">
      <div className="text-xs font-semibold text-zinc-500 mb-2">ε-pseudospectra (pre-rendered)</div>
      <div className="flex gap-2 mb-2 text-xs flex-wrap">
        {PSEUDO.map((p) => (
          <button key={p.id}
            className={`px-2 py-1 rounded border ${pick === p.id ? "bg-accent text-white" : "border-zinc-300"}`}
            onClick={() => setPick(p.id)}>{p.label}</button>
        ))}
      </div>
      <img src={cur.src} alt={cur.label} className="rounded border border-zinc-200 dark:border-zinc-800" style={{ width: "200px", imageRendering: "pixelated" }}/>
      <div className="text-xs text-zinc-500 mt-2">
        Color rings show ε-pseudospectrum bands (ε ∈ &#123;0.01, 0.1, 1, 5, 20, ∞&#125;).
        Wider rings around the eigenvalues indicate higher non-normality.
      </div>
    </div>
  );
}

function ShareButton() {
  return (
    <button type="button" className="text-xs underline text-zinc-500 mt-2"
      onClick={() => navigator.clipboard.writeText(window.location.href)}>
      copy share link
    </button>
  );
}

export default function Fig4Demo() {
  const [theta, setTheta] = useState(0);
  const [pseudo, setPseudo] = useState("matrix-b");

  useEffect(() => {
    const u = decodeFig4(readQuery("fig4"));
    if (u) { setTheta(u.theta); setPseudo(u.pseudo); }
  }, []);

  useEffect(() => {
    writeQuery("fig4", encodeFig4({ theta, pseudo }));
  }, [theta, pseudo]);

  return (
    <div className="my-6">
      <PanelTransient theta={theta} setTheta={setTheta} />
      <PanelSchur />
      <PanelPseudo pick={pseudo} setPick={setPseudo} />
      <ShareButton />
    </div>
  );
}
