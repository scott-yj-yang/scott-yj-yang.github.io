import { useMemo, useState } from "react";
import { FigPanel } from "./FigPanel";
import { Slider } from "./Slider";
import { Eq } from "./Equation";
import { TimeSeriesPlot } from "./TimeSeriesPlot";
import { simulateLinearRK4, deltaPulse, sustainedInput } from "./lib/simulation";
import { FIG2_PRESETS } from "./lib/params";

type Mode = "pulse" | "sustained";

export default function Fig2HebbianVsBalanced() {
  const [preset, setPreset] = useState(2);  // 4x amplification, paper default
  const [mode, setMode] = useState<Mode>("pulse");
  const [kI, setKI] = useState(1.1);
  const tau = 1;
  const tEnd = 8;
  const dt = 0.005;

  const { hebbianW, balancedW } = FIG2_PRESETS[preset];

  const { hebbianSeries, balancedSeries } = useMemo(() => {
    const Hw: number[][] = [[hebbianW]];
    const Bw: number[][] = [
      [balancedW, -kI * balancedW],
      [balancedW, -kI * balancedW],
    ];
    const input = mode === "pulse" ? deltaPulse([1], 0.005) : sustainedInput([1]);
    const inputB = mode === "pulse" ? deltaPulse([1, 0], 0.005) : sustainedInput([1, 0]);

    const hebTraj = simulateLinearRK4({ W: Hw, r0: [0], input, tau, dt, tEnd });
    const balTraj = simulateLinearRK4({ W: Bw, r0: [0, 0], input: inputB, tau, dt, tEnd });

    const baseHeb = simulateLinearRK4({ W: [[0]], r0: [0], input, tau, dt, tEnd });
    const baseBal = simulateLinearRK4({ W: [[0, 0], [0, 0]], r0: [0, 0], input: inputB, tau, dt, tEnd });

    const hebbianSeries = [
      { label: "Recurrent (w > 0)", color: "#dc2626", data: hebTraj.t.map((t, i) => [t, hebTraj.r[i][0]] as [number, number]) },
      { label: "No recurrence (w = 0)", color: "#2563eb", data: baseHeb.t.map((t, i) => [t, baseHeb.r[i][0]] as [number, number]) },
    ];
    const balancedSeries = [
      { label: "rE recurrent", color: "#dc2626", data: balTraj.t.map((t, i) => [t, balTraj.r[i][0]] as [number, number]) },
      { label: "rE no recurrence", color: "#2563eb", data: baseBal.t.map((t, i) => [t, baseBal.r[i][0]] as [number, number]) },
    ];
    return { hebbianSeries, balancedSeries };
  }, [hebbianW, balancedW, kI, mode]);

  return (
    <FigPanel
      figNumber={2}
      title="Hebbian vs. balanced amplification"
      controls={
        <>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Amplification preset</span>
            <select
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              value={preset}
              onChange={(e) => setPreset(parseInt(e.target.value, 10))}
            >
              {FIG2_PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Input type</span>
            <div className="flex gap-1">
              <button
                className={`flex-1 rounded-md px-2 py-1 text-[10px] font-medium ${mode === "pulse" ? "bg-accent text-white" : "border border-zinc-300 dark:border-zinc-700"}`}
                onClick={() => setMode("pulse")}
              >
                Pulse
              </button>
              <button
                className={`flex-1 rounded-md px-2 py-1 text-[10px] font-medium ${mode === "sustained" ? "bg-accent text-white" : "border border-zinc-300 dark:border-zinc-700"}`}
                onClick={() => setMode("sustained")}
              >
                Sustained
              </button>
            </div>
          </div>
          <Slider label="kI (balanced only)" value={kI} min={1} max={3} step={0.01} onChange={setKI} />
          <div className="text-[10px] text-zinc-500">
            Hebbian w: <span className="font-mono">{hebbianW.toFixed(3)}</span><br />
            Balanced w: <span className="font-mono">{balancedW.toFixed(3)}</span>
          </div>
        </>
      }
      caption={
        <>
          The Hebbian network (left) achieves amplification by slowing down: as <Eq>{"w \\to 1"}</Eq> the
          decay timescale <Eq>{"\\tau/(1-w)"}</Eq> diverges. The balanced network (right) achieves the same
          steady-state amplification with essentially the same dynamics as the unrecurrent case — only the
          height of the response changes, not its width.
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hebbian (single E pop)</h4>
          <TimeSeriesPlot series={hebbianSeries} width={360} yLabel="rE" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Balanced (E + I)</h4>
          <TimeSeriesPlot series={balancedSeries} width={360} yLabel="rE" />
        </div>
      </div>
    </FigPanel>
  );
}
