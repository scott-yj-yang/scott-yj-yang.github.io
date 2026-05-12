import { useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3line } from "d3-shape";
import { FigPanel } from "./FigPanel";
import { Slider } from "./Slider";
import { Eq } from "./Equation";
import { simulateLinearRK4 } from "./lib/simulation";
import { FIG1_DEFAULT } from "./lib/params";

const SNAPSHOT_TIMES = [0, 0.4, 0.8, 1.5, 3.0];
const E_COLOR = "#16a34a";
const I_COLOR = "#dc2626";
const SUM_COLOR = "#2563eb";
const DIFF_COLOR = "#0f172a";

// Sequential heat colormap: dark red (low) → orange → yellow (high).
// Negative values shown as cool tones (blue).
function activityColor(v: number, vMax: number): string {
  const t = Math.max(-1, Math.min(1, v / Math.max(vMax, 0.1)));
  if (t >= 0) {
    const r = Math.round(60 + (254 - 60) * t);
    const g = Math.round(10 + (243 - 10) * t);
    const b = Math.round(10 + (199 - 10) * t);
    return `rgb(${r},${g},${b})`;
  }
  const k = -t;
  const r = Math.round(60 - 60 * k);
  const g = Math.round(10 + 60 * k);
  const b = Math.round(10 + 180 * k);
  return `rgb(${r},${g},${b})`;
}

export default function Fig1TwoPopulation() {
  const [w, setW] = useState(FIG1_DEFAULT.w);
  const [kI, setKI] = useState(FIG1_DEFAULT.kI);
  const [tau, setTau] = useState(FIG1_DEFAULT.tau);
  const [rE0, setRE0] = useState(FIG1_DEFAULT.rE0);
  const [rI0, setRI0] = useState(FIG1_DEFAULT.rI0);
  const [hoverT, setHoverT] = useState<number | null>(null);

  const tEnd = 5;

  const { traj, wFF, wPlus, lambda } = useMemo(() => {
    const W = [
      [w, -kI * w],
      [w, -kI * w],
    ];
    const traj = simulateLinearRK4({
      W,
      r0: [rE0, rI0],
      input: () => [0, 0],
      tau,
      dt: 0.005,
      tEnd,
    });
    return {
      traj,
      wFF: w * (1 + kI),
      wPlus: w * (kI - 1),
      lambda: -w * (kI - 1),
    };
  }, [w, kI, tau, rE0, rI0]);

  function rAt(t: number): { rE: number; rI: number } {
    const dt = traj.t[1] - traj.t[0];
    let idx = Math.round(t / dt);
    idx = Math.max(0, Math.min(traj.t.length - 1, idx));
    return { rE: traj.r[idx][0], rI: traj.r[idx][1] };
  }

  const vMax = useMemo(() => {
    let m = 0;
    for (const r of traj.r) {
      m = Math.max(m, Math.abs(r[0]), Math.abs(r[1]), Math.abs(r[0] + r[1]), Math.abs(r[0] - r[1]));
    }
    return m;
  }, [traj]);

  const plotW = 460;
  const plotH = 230;
  const margin = { top: 12, right: 16, bottom: 38, left: 44 };
  const innerW = plotW - margin.left - margin.right;
  const innerH = plotH - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleLinear().domain([0, tEnd]).range([0, innerW]), [innerW]);
  const yScale = useMemo(() => {
    let lo = 0,
      hi = 0;
    for (const r of traj.r) {
      const sum = r[0] + r[1];
      const diff = r[0] - r[1];
      lo = Math.min(lo, r[0], r[1], sum, diff);
      hi = Math.max(hi, r[0], r[1], sum, diff);
    }
    const padding = (hi - lo) * 0.06 || 0.1;
    return scaleLinear().domain([lo - padding, hi + padding]).range([innerH, 0]).nice();
  }, [traj, innerH]);

  const pathFn = d3line<[number, number]>().x((d) => xScale(d[0])).y((d) => yScale(d[1]));

  const pathE = pathFn(traj.t.map((t, i) => [t, traj.r[i][0]] as [number, number])) ?? "";
  const pathI = pathFn(traj.t.map((t, i) => [t, traj.r[i][1]] as [number, number])) ?? "";
  const pathSum = pathFn(traj.t.map((t, i) => [t, traj.r[i][0] + traj.r[i][1]] as [number, number])) ?? "";
  const pathDiff = pathFn(traj.t.map((t, i) => [t, traj.r[i][0] - traj.r[i][1]] as [number, number])) ?? "";

  const xTicks = xScale.ticks(6);
  const yTicks = yScale.ticks(5);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPxRaw = (e.clientX - rect.left) * (plotW / rect.width);
    const xPx = xPxRaw - margin.left;
    const t = xScale.invert(xPx);
    if (t >= 0 && t <= tEnd) setHoverT(t);
    else setHoverT(null);
  }
  function handleMouseLeave() {
    setHoverT(null);
  }

  const hoverState = hoverT != null ? rAt(hoverT) : null;
  const displayState = hoverState ?? rAt(0);
  const displayT = hoverT ?? 0;

  return (
    <FigPanel
      figNumber={1}
      title="The two-population balanced circuit"
      controls={
        <>
          <div>
            <Slider label="w (recurrent strength)" value={w} min={0} max={10} step={0.05} onChange={setW} />
            <p className="mt-1 text-[10px] leading-snug text-zinc-500">
              How strongly each population drives itself and the other. Larger <Eq>{"w"}</Eq> → more amplification.
            </p>
          </div>
          <div>
            <Slider label="kI (inhibition ratio)" value={kI} min={1} max={3} step={0.01} onChange={setKI} />
            <p className="mt-1 text-[10px] leading-snug text-zinc-500">
              Inhibition strength relative to excitation. <Eq>{"k_I=1"}</Eq> just balances; <Eq>{"k_I>1"}</Eq> means inhibition dominates.
            </p>
          </div>
          <div>
            <Slider label="τ (time constant)" value={tau} min={0.1} max={3} step={0.05} onChange={setTau} />
            <p className="mt-1 text-[10px] leading-snug text-zinc-500">
              Intrinsic single-neuron decay time. Plot time is shown in units of <Eq>{"\\tau"}</Eq>.
            </p>
          </div>
          <div>
            <Slider label="rE(0)" value={rE0} min={-1} max={1} step={0.01} onChange={setRE0} />
            <Slider label="rI(0)" value={rI0} min={-1} max={1} step={0.01} onChange={setRI0} />
            <p className="mt-1 text-[10px] leading-snug text-zinc-500">
              Initial firing rates of E and I (rel. baseline). Paper's case: <Eq>{"r_E(0)=1, r_I(0)=0"}</Eq> — a pure excitatory pulse.
            </p>
          </div>
          <button
            className="rounded-md border border-zinc-300 px-2 py-1 text-[10px] font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => {
              setW(FIG1_DEFAULT.w);
              setKI(FIG1_DEFAULT.kI);
              setTau(FIG1_DEFAULT.tau);
              setRE0(FIG1_DEFAULT.rE0);
              setRI0(FIG1_DEFAULT.rI0);
            }}
          >
            Reset to paper defaults
          </button>
        </>
      }
      caption={
        <>
          <strong>How to read this:</strong> Panel A shows the two-population circuit. Panel B has activity snapshots (colored circles, E on top, I below) at five time points, dashed-lined to the time-series plot. Hover anywhere on the plot to see all four lines at any time — the circuit diagram's E and I circles update too. Panel C shows the hidden feedforward equivalent that gives this circuit its name.
        </>
      }
    >
      <div className="space-y-4">
        {/* Panel A: Circuit diagram + legend */}
        <div className="flex items-center gap-3 rounded-md bg-white p-3 dark:bg-zinc-950">
          <CircuitDiagram w={w} kI={kI} rE={displayState.rE} rI={displayState.rI} vMax={vMax} />
          <div className="text-[11px] leading-snug text-zinc-700 dark:text-zinc-300">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Panel A — circuit</div>
            <ul className="mt-1 space-y-0.5">
              <li>
                <span className="inline-block w-3 h-0.5 bg-green-600 align-middle mr-1" />
                Green = excitatory (<Eq>{"w"}</Eq>)
              </li>
              <li>
                <span className="inline-block w-3 h-0.5 bg-red-600 align-middle mr-1" />
                Red = inhibitory (<Eq>{"-w k_I"}</Eq>)
              </li>
              <li>Each cell projects to itself and the other.</li>
              <li className="mt-1.5 text-[10px] text-zinc-500">
                Circle colors: live firing rates at t = {displayT.toFixed(2)}τ <br />
                <span style={{ color: E_COLOR }}>rE = {displayState.rE.toFixed(2)}</span>{" · "}
                <span style={{ color: I_COLOR }}>rI = {displayState.rI.toFixed(2)}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Panel B top: Activity snapshots */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Panel B (top) — snapshots of E & I at each marked time
          </div>
          <div className="flex justify-between gap-1" style={{ paddingLeft: margin.left, paddingRight: margin.right }}>
            {SNAPSHOT_TIMES.map((t) => {
              const { rE, rI } = rAt(t);
              return <ActivitySnapshot key={t} t={t} rE={rE} rI={rI} vMax={vMax} highlight={hoverT != null && Math.abs(hoverT - t) < 0.08} />;
            })}
          </div>
        </div>

        {/* Panel B bottom: Time series */}
        <div className="overflow-hidden rounded-md bg-white p-1 dark:bg-zinc-950">
          <svg
            viewBox={`0 0 ${plotW} ${plotH}`}
            className="block w-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <g transform={`translate(${margin.left},${margin.top})`}>
              {yTicks.map((t) => (
                <g key={`y${t}`} transform={`translate(0,${yScale(t)})`}>
                  <line x1={0} x2={innerW} className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <text x={-6} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[10px]">
                    {t}
                  </text>
                </g>
              ))}
              {xTicks.map((t) => (
                <g key={`x${t}`} transform={`translate(${xScale(t)},${innerH})`}>
                  <line y1={0} y2={4} className="stroke-zinc-400" />
                  <text y={16} textAnchor="middle" className="fill-zinc-500 text-[10px]">
                    {t}
                  </text>
                </g>
              ))}
              <line x1={0} x2={innerW} y1={innerH} y2={innerH} className="stroke-zinc-400" />
              <line x1={0} x2={0} y1={0} y2={innerH} className="stroke-zinc-400" />
              {/* snapshot time markers */}
              {SNAPSHOT_TIMES.map((t) => (
                <line
                  key={`snap${t}`}
                  x1={xScale(t)}
                  x2={xScale(t)}
                  y1={0}
                  y2={innerH}
                  className="stroke-zinc-300 dark:stroke-zinc-700"
                  strokeDasharray="2 3"
                />
              ))}
              {/* lines */}
              <path d={pathSum} fill="none" stroke={SUM_COLOR} strokeWidth={2.5} />
              <path d={pathDiff} fill="none" stroke={DIFF_COLOR} strokeWidth={2} />
              <path d={pathE} fill="none" stroke={E_COLOR} strokeWidth={2} />
              <path d={pathI} fill="none" stroke={I_COLOR} strokeWidth={2} />
              {/* hover indicator */}
              {hoverT != null && hoverState && (
                <>
                  <line x1={xScale(hoverT)} x2={xScale(hoverT)} y1={0} y2={innerH} className="stroke-zinc-500" strokeDasharray="3 3" />
                  <circle cx={xScale(hoverT)} cy={yScale(hoverState.rE + hoverState.rI)} r={4} fill={SUM_COLOR} stroke="white" strokeWidth={1} />
                  <circle cx={xScale(hoverT)} cy={yScale(hoverState.rE - hoverState.rI)} r={4} fill={DIFF_COLOR} stroke="white" strokeWidth={1} />
                  <circle cx={xScale(hoverT)} cy={yScale(hoverState.rE)} r={4} fill={E_COLOR} stroke="white" strokeWidth={1} />
                  <circle cx={xScale(hoverT)} cy={yScale(hoverState.rI)} r={4} fill={I_COLOR} stroke="white" strokeWidth={1} />
                </>
              )}
              {/* axis labels */}
              <text x={innerW / 2} y={innerH + 32} textAnchor="middle" className="fill-zinc-700 text-[11px] dark:fill-zinc-300">
                Time (τ)
              </text>
              <text transform={`translate(-34,${innerH / 2}) rotate(-90)`} textAnchor="middle" className="fill-zinc-700 text-[11px] dark:fill-zinc-300">
                Response
              </text>
            </g>
            {/* legend */}
            <g transform={`translate(${margin.left + 8},${margin.top + 4})`}>
              {[
                { label: "rE + rI  (sum)", color: SUM_COLOR },
                { label: "rE − rI  (difference)", color: DIFF_COLOR },
                { label: "rE  (excitatory)", color: E_COLOR },
                { label: "rI  (inhibitory)", color: I_COLOR },
              ].map((s, i) => (
                <g key={i} transform={`translate(0, ${i * 13})`}>
                  <line x1={0} x2={14} y1={4} y2={4} stroke={s.color} strokeWidth={2.5} />
                  <text x={20} y={8} className="fill-zinc-700 text-[10px] dark:fill-zinc-300">
                    {s.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Hover readout */}
        <div className="rounded-md bg-zinc-50 px-3 py-2 text-[10px] dark:bg-zinc-900">
          {hoverT != null && hoverState ? (
            <span>
              <span className="font-semibold">At t = {hoverT.toFixed(2)}τ:</span>{" "}
              <span style={{ color: SUM_COLOR }}>sum = {(hoverState.rE + hoverState.rI).toFixed(3)}</span>{" · "}
              <span style={{ color: DIFF_COLOR }}>diff = {(hoverState.rE - hoverState.rI).toFixed(3)}</span>{" · "}
              <span style={{ color: E_COLOR }}>rE = {hoverState.rE.toFixed(3)}</span>{" · "}
              <span style={{ color: I_COLOR }}>rI = {hoverState.rI.toFixed(3)}</span>
            </span>
          ) : (
            <span className="text-zinc-500">Hover the plot to read values at any time.</span>
          )}
        </div>

        {/* Panel C: Feedforward equivalent */}
        <div className="flex items-center gap-3 rounded-md bg-white p-3 dark:bg-zinc-950">
          <FeedforwardDiagram wFF={wFF} wPlus={wPlus} />
          <div className="text-[11px] leading-snug text-zinc-700 dark:text-zinc-300">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Panel C — feedforward equivalent</div>
            <p className="mt-1">
              The fully-recurrent circuit on the left acts <em>as if</em> the difference pattern (E−I) drives the sum pattern (E+I) through a hidden feedforward weight <Eq>{"w_{FF}"}</Eq>. The sum doesn't feed back into the difference, so there's no loop, and so <em>no slowing</em>.
            </p>
          </div>
        </div>

        {/* Computed values */}
        <div className="grid grid-cols-3 gap-2 rounded-md bg-zinc-100 p-3 text-[11px] dark:bg-zinc-800">
          <div>
            <div className="text-zinc-500">Feedforward weight</div>
            <div className="mt-1 font-mono">
              <Eq>{`w_{FF} = w(1+k_I) = ${wFF.toFixed(3)}`}</Eq>
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Sum self-weight</div>
            <div className="mt-1 font-mono">
              <Eq>{`w_+ = w(k_I-1) = ${wPlus.toFixed(3)}`}</Eq>
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Non-zero eigenvalue</div>
            <div className="mt-1 font-mono">
              <Eq>{`\\lambda = ${lambda.toFixed(3)}`}</Eq>
            </div>
          </div>
        </div>
      </div>
    </FigPanel>
  );
}

function CircuitDiagram({ w, kI, rE, rI, vMax }: { w: number; kI: number; rE: number; rI: number; vMax: number }) {
  const Ex = 110;
  const Ey = 50;
  const Iy = 150;
  const radius = 22;
  const eColor = activityColor(rE, vMax);
  const iColor = activityColor(rI, vMax);
  const eThick = Math.max(1, Math.min(5, w * 1.2));
  const iThick = Math.max(1, Math.min(5, kI * w * 1.2));

  return (
    <svg width={200} height={210} className="shrink-0">
      <defs>
        <marker id="ca-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#16a34a" />
        </marker>
        <marker id="ca-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#dc2626" />
        </marker>
        <marker id="ca-arrow-zinc" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#52525b" />
        </marker>
      </defs>
      {/* External inputs */}
      <line x1={20} y1={Ey} x2={Ex - radius - 2} y2={Ey} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#ca-arrow-zinc)" />
      <text x={14} y={Ey - 6} className="fill-zinc-600 text-[10px] font-semibold dark:fill-zinc-400">
        I_E
      </text>
      <line x1={20} y1={Iy} x2={Ex - radius - 2} y2={Iy} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#ca-arrow-zinc)" />
      <text x={14} y={Iy - 6} className="fill-zinc-600 text-[10px] font-semibold dark:fill-zinc-400">
        I_I
      </text>
      {/* E -> I (green, slightly left side) */}
      <line x1={Ex - 8} y1={Ey + radius} x2={Ex - 8} y2={Iy - radius - 2} stroke="#16a34a" strokeWidth={eThick} markerEnd="url(#ca-arrow-green)" />
      <text x={Ex - 28} y={(Ey + Iy) / 2 + 3} className="fill-green-700 text-[10px] font-bold">
        w
      </text>
      {/* I -> E (red, slightly right side) */}
      <line x1={Ex + 8} y1={Iy - radius} x2={Ex + 8} y2={Ey + radius + 2} stroke="#dc2626" strokeWidth={iThick} markerEnd="url(#ca-arrow-red)" />
      <text x={Ex + 14} y={(Ey + Iy) / 2 + 3} className="fill-red-700 text-[10px] font-bold">
        −wk_I
      </text>
      {/* E self-loop */}
      <path
        d={`M ${Ex + radius - 4} ${Ey - 8} C ${Ex + radius + 28} ${Ey - 30}, ${Ex + radius + 20} ${Ey + 18}, ${Ex + radius - 2} ${Ey + 6}`}
        fill="none"
        stroke="#16a34a"
        strokeWidth={eThick}
        markerEnd="url(#ca-arrow-green)"
      />
      <text x={Ex + radius + 14} y={Ey - 18} className="fill-green-700 text-[10px] font-bold">
        w
      </text>
      {/* I self-loop */}
      <path
        d={`M ${Ex + radius - 4} ${Iy + 8} C ${Ex + radius + 28} ${Iy + 30}, ${Ex + radius + 20} ${Iy - 18}, ${Ex + radius - 2} ${Iy - 6}`}
        fill="none"
        stroke="#dc2626"
        strokeWidth={iThick}
        markerEnd="url(#ca-arrow-red)"
      />
      <text x={Ex + radius + 14} y={Iy + 32} className="fill-red-700 text-[10px] font-bold">
        −wk_I
      </text>
      {/* nodes (drawn last so they're on top) */}
      <circle cx={Ex} cy={Ey} r={radius} fill={eColor} stroke="#1f2937" strokeWidth={1.5} />
      <text x={Ex} y={Ey} dy="0.32em" textAnchor="middle" className="fill-white text-sm font-bold" style={{ paintOrder: "stroke" }} stroke="black" strokeWidth={0.4}>
        E
      </text>
      <circle cx={Ex} cy={Iy} r={radius} fill={iColor} stroke="#1f2937" strokeWidth={1.5} />
      <text x={Ex} y={Iy} dy="0.32em" textAnchor="middle" className="fill-white text-sm font-bold" style={{ paintOrder: "stroke" }} stroke="black" strokeWidth={0.4}>
        I
      </text>
    </svg>
  );
}

function ActivitySnapshot({ t, rE, rI, vMax, highlight }: { t: number; rE: number; rI: number; vMax: number; highlight: boolean }) {
  return (
    <div className={`flex flex-col items-center text-[10px] ${highlight ? "ring-2 ring-amber-400 rounded-md p-1" : ""}`}>
      <div className="text-zinc-500">t = {t.toFixed(1)}τ</div>
      <div className="mt-1 flex flex-col gap-1">
        <div className="w-9 h-9 rounded-full border border-zinc-700 dark:border-zinc-300" style={{ background: activityColor(rE, vMax) }} title={`rE = ${rE.toFixed(3)}`} />
        <div className="w-9 h-9 rounded-full border border-zinc-700 dark:border-zinc-300" style={{ background: activityColor(rI, vMax) }} title={`rI = ${rI.toFixed(3)}`} />
      </div>
      <div className="mt-1 flex flex-col gap-0 text-[9px] font-mono leading-tight">
        <span style={{ color: E_COLOR }}>{rE.toFixed(2)}</span>
        <span style={{ color: I_COLOR }}>{rI.toFixed(2)}</span>
      </div>
    </div>
  );
}

function FeedforwardDiagram({ wFF, wPlus }: { wFF: number; wPlus: number }) {
  return (
    <svg width={200} height={110} className="shrink-0">
      <defs>
        <marker id="ff-arrow-dark" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#0f172a" />
        </marker>
        <marker id="ff-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#dc2626" />
        </marker>
      </defs>
      <ellipse cx={40} cy={55} rx={28} ry={20} className="fill-white stroke-zinc-900 dark:fill-zinc-900 dark:stroke-zinc-100" strokeWidth={1.5} />
      <text x={40} y={55} dy="0.32em" textAnchor="middle" className="fill-zinc-900 text-[11px] font-bold dark:fill-zinc-100">
        E − I
      </text>
      <ellipse cx={150} cy={55} rx={28} ry={20} className="fill-white stroke-zinc-900 dark:fill-zinc-900 dark:stroke-zinc-100" strokeWidth={1.5} />
      <text x={150} y={55} dy="0.32em" textAnchor="middle" className="fill-zinc-900 text-[11px] font-bold dark:fill-zinc-100">
        E + I
      </text>
      <line x1={68} y1={55} x2={120} y2={55} stroke="#0f172a" className="dark:stroke-zinc-100" strokeWidth={Math.max(1, Math.min(5, wFF * 0.8))} markerEnd="url(#ff-arrow-dark)" />
      <text x={94} y={49} textAnchor="middle" className="fill-zinc-900 text-[10px] font-bold dark:fill-zinc-100">
        w_FF = {wFF.toFixed(2)}
      </text>
      <path d={`M 168 46 C 196 30, 196 80, 168 64`} fill="none" stroke="#dc2626" strokeWidth={Math.max(0.7, Math.min(3, Math.abs(wPlus) * 1.5))} markerEnd="url(#ff-arrow-red)" />
      <text x={178} y={22} className="fill-red-700 text-[10px] font-bold">
        −w₊ = {(-wPlus).toFixed(2)}
      </text>
    </svg>
  );
}
