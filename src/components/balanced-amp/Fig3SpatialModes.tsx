import { useEffect, useMemo, useState } from "react";
import { FigPanel } from "./FigPanel";
import { Slider } from "./Slider";
import { Eq } from "./Equation";
import { TimeSeriesPlot } from "./TimeSeriesPlot";
import { HeatmapGrid } from "./HeatmapGrid";

interface ModeData {
  index: number;
  wFF: number;
  difference: { E: number[]; I: number[] };
  sum: { E: number[]; I: number[] };
}

interface ModesPayload {
  N: number;
  gridMm: number;
  orientationMap: number[][];
  evokedMap0deg: number[][];
  modes: ModeData[];
}

export default function Fig3SpatialModes() {
  const [data, setData] = useState<ModesPayload | null>(null);
  const [activeMode, setActiveMode] = useState(1);
  const [tau, setTau] = useState(1);

  useEffect(() => {
    fetch("/data/balanced-amp/modes.json")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load modes.json", err));
  }, []);

  const sim = useMemo(() => {
    if (!data) return null;
    const mode = data.modes.find((m) => m.index === activeMode) ?? data.modes[0];
    const N = data.N;
    const r0E = new Float32Array(mode.difference.E);
    const r0I = new Float32Array(mode.difference.I);
    const tEnd = 5;
    const dt = 0.02;
    const ts: number[] = [];
    const mag: number[] = [];
    for (let t = 0; t <= tEnd; t += dt) {
      const rm = Math.exp(-t / tau);
      const rp = (mode.wFF * t / tau) * Math.exp(-t / tau);
      ts.push(t);
      mag.push(Math.hypot(rm, rp));
    }
    return { mode, N, r0E, r0I, ts, mag, tEnd };
  }, [data, activeMode, tau]);

  if (!data) {
    return (
      <FigPanel
        figNumber={3}
        title="Spatial network: orientation map + sum/difference modes"
        controls={<div className="text-xs text-zinc-500">Loading…</div>}
      >
        <div className="text-zinc-500">Loading modes.json…</div>
      </FigPanel>
    );
  }

  const flatOrient = data.orientationMap.flat();
  const flatEvoked = data.evokedMap0deg.flat();
  const modes = data.modes;

  return (
    <FigPanel
      figNumber={3}
      title="Spatial network: orientation map + sum/difference modes"
      controls={
        <>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Active mode pair</span>
            <select
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              value={activeMode}
              onChange={(e) => setActiveMode(parseInt(e.target.value, 10))}
            >
              {modes.map((m) => (
                <option key={m.index} value={m.index}>
                  Mode {m.index} (w_FF = {m.wFF.toFixed(3)})
                </option>
              ))}
            </select>
          </div>
          <Slider label="τ (time constant)" value={tau} min={0.1} max={3} step={0.05} onChange={setTau} />
        </>
      }
      caption={
        <>
          The orientation map (top-left) is a 4×4 grid of pinwheels. The top sum/difference mode pairs
          (right) are eigenvectors of <Eq>{"W_E + W_I"}</Eq>. Mode 1 is spatially uniform; modes 2 and 3
          look strikingly like orientation maps. The bottom plot shows the impulse response of mode magnitude,
          which follows <Eq>{"(t/\\tau) e^{-t/\\tau}"}</Eq> when the eigenvalue is zero — a fast, non-slowing
          transient.
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Orientation map</h5>
            <HeatmapGrid values={flatOrient} rows={data.N} cols={data.N} cellPx={5} vRange={[0, 180]} colormap="viridis" />
          </div>
          <div>
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Evoked map (0°)</h5>
            <HeatmapGrid values={flatEvoked} rows={data.N} cols={data.N} cellPx={5} colormap="viridis" />
          </div>
          <div>
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Selected sum mode (p+)</h5>
            <HeatmapGrid values={sim!.mode.sum.E} rows={data.N} cols={data.N} cellPx={5} />
          </div>
          <div>
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Difference mode p−, E rates</h5>
            <HeatmapGrid values={sim!.mode.difference.E} rows={data.N} cols={data.N} cellPx={5} />
          </div>
          <div>
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Difference mode p−, I rates</h5>
            <HeatmapGrid values={sim!.mode.difference.I} rows={data.N} cols={data.N} cellPx={5} />
          </div>
          <div className="rounded-md bg-zinc-100 p-2 text-[10px] dark:bg-zinc-800">
            <div className="text-zinc-500">Feedforward weight</div>
            <div className="mt-1 font-mono">w<sub>FF</sub> = {sim!.mode.wFF.toFixed(3)}</div>
          </div>
        </div>
        <div>
          <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">|r(t)| impulse response from this difference mode</h5>
          <TimeSeriesPlot
            series={[{ label: "|r(t)|", color: "#2563eb", data: sim!.ts.map((t, i) => [t, sim!.mag[i]]) }]}
            width={520}
            height={180}
            yLabel="|r(t)|"
          />
        </div>
      </div>
    </FigPanel>
  );
}
