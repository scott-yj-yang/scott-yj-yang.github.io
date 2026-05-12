import { useEffect, useMemo, useState } from "react";
import { create, all } from "mathjs";
import ComplexPlane from "./plots/ComplexPlane";
import { sample, type SampleSpec } from "./math/randomMatrix";
import { encodeFig5, decodeFig5, readQuery, writeQuery } from "./math/urlState";

const math = create(all);

type Mode = SampleSpec["mode"];

const MODES: { id: Mode; label: string }[] = [
  { id: "iid", label: "IID Gaussian (Girko)" },
  { id: "symmetric", label: "Symmetric (Wigner)" },
  { id: "elliptic", label: "Elliptic" },
  { id: "ei", label: "E/I (Dale's law)" },
  { id: "multipop", label: "Multi-population" },
];

function eigsOf(M: number[][]): { re: number; im: number }[] {
  const result = math.eigs(math.matrix(M));
  const values = result.values.toArray() as Array<number | { re: number; im: number }>;
  return values.map((v) =>
    typeof v === "number" ? { re: v, im: 0 } : { re: v.re, im: v.im },
  );
}

export default function Fig5Demo() {
  const [mode, setMode] = useState<Mode>("iid");
  const [N, setN] = useState(150);
  const [sigma, setSigma] = useState(1);
  const [rho, setRho] = useState(0.5);
  const [f, setF] = useState(0.8);
  const [muE, setMuE] = useState(1);
  const [muI, setMuI] = useState(-4);
  const [alpha, setAlpha] = useState(0.5);
  const [sigmaE, setSigmaE] = useState(1);
  const [sigmaI, setSigmaI] = useState(2);
  const [seed, setSeed] = useState(42);
  const [animating, setAnimating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [eigs, setEigs] = useState<{ re: number; im: number }[]>([]);

  useEffect(() => {
    const u = decodeFig5(readQuery("fig5"));
    if (u) {
      if (MODES.some((m) => m.id === u.mode)) setMode(u.mode as Mode);
      setN(u.N);
      setSeed(u.seed);
    }
  }, []);

  useEffect(() => {
    writeQuery("fig5", encodeFig5({ mode, N, seed }));
  }, [mode, N, seed]);

  const spec: SampleSpec = useMemo(() => {
    if (mode === "iid") return { mode, N, sigma, seed };
    if (mode === "symmetric") return { mode, N, sigma, seed };
    if (mode === "elliptic") return { mode, N, sigma, rho, seed };
    if (mode === "ei") return { mode, N, sigma, f, muE, muI, seed };
    return { mode, N, alpha, sigmaE, sigmaI, seed };
  }, [mode, N, sigma, rho, f, muE, muI, alpha, sigmaE, sigmaI, seed]);

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      try {
        const M = sample(spec);
        setEigs(eigsOf(M));
      } catch (err) {
        console.warn("Fig5 eig failed", err);
      } finally {
        setBusy(false);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [spec]);

  useEffect(() => {
    if (!animating) return;
    const id = setInterval(() => setSeed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [animating]);

  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 md:col-span-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>Eigenspectrum (N = {N})</span>
          {busy && <span className="text-zinc-400">computing…</span>}
        </div>
        <ComplexPlane width={420} height={360}
          reRange={[-3, 3]} imRange={[-3, 3]}
          points={eigs.map((e, i) => ({ id: `e${i}`, re: e.re, im: e.im, color: "rgba(124,58,237,0.6)" }))}/>
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 text-sm">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Mode</div>
        <div className="flex flex-col gap-1 text-xs">
          {MODES.map((m) => (
            <label key={m.id} className="flex items-center gap-2">
              <input type="radio" checked={mode === m.id} onChange={() => setMode(m.id)} />
              {m.label}
            </label>
          ))}
        </div>
        <hr className="my-3 border-zinc-200 dark:border-zinc-800"/>
        <Slider label="N" min={20} max={200} step={10} value={N} onChange={setN}/>
        {(mode === "iid" || mode === "symmetric" || mode === "elliptic" || mode === "ei") && (
          <Slider label="σ" min={0.1} max={3} step={0.1} value={sigma} onChange={setSigma}/>
        )}
        {mode === "elliptic" && (
          <Slider label="ρ (correlation)" min={-1} max={1} step={0.05} value={rho} onChange={setRho}/>
        )}
        {mode === "ei" && (
          <>
            <Slider label="f (frac excitatory)" min={0.1} max={0.9} step={0.05} value={f} onChange={setF}/>
            <Slider label="μ_E" min={0} max={5} step={0.1} value={muE} onChange={setMuE}/>
            <Slider label="μ_I" min={-10} max={0} step={0.1} value={muI} onChange={setMuI}/>
          </>
        )}
        {mode === "multipop" && (
          <>
            <Slider label="α (frac type 1)" min={0.1} max={0.9} step={0.05} value={alpha} onChange={setAlpha}/>
            <Slider label="σ_E" min={0.1} max={3} step={0.1} value={sigmaE} onChange={setSigmaE}/>
            <Slider label="σ_I" min={0.1} max={3} step={0.1} value={sigmaI} onChange={setSigmaI}/>
          </>
        )}
        <div className="flex gap-2 mt-3 flex-wrap items-center">
          <button className="px-2 py-1 rounded border border-zinc-300 text-xs" onClick={() => setSeed((s) => s + 1)}>
            Re-roll
          </button>
          <button
            className={`px-2 py-1 rounded border text-xs ${animating ? "bg-accent text-white" : "border-zinc-300"}`}
            onClick={() => setAnimating((a) => !a)}>
            {animating ? "Stop" : "Animate"}
          </button>
          <button type="button" className="text-xs underline text-zinc-500 ml-2"
            onClick={() => navigator.clipboard.writeText(window.location.href)}>
            copy share link
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider(props: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-2">
      <div className="text-xs text-zinc-500">{props.label} = {props.value}</div>
      <input type="range" min={props.min} max={props.max} step={props.step} value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))} className="w-full"/>
    </div>
  );
}
