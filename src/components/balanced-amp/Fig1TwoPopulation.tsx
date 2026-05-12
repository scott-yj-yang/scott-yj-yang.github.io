import { useMemo, useState } from "react";
import { FigPanel } from "./FigPanel";
import { Slider } from "./Slider";
import { Eq } from "./Equation";
import { TimeSeriesPlot } from "./TimeSeriesPlot";
import { simulateLinearRK4 } from "./lib/simulation";
import { FIG1_DEFAULT } from "./lib/params";

export default function Fig1TwoPopulation() {
  const [w, setW] = useState(FIG1_DEFAULT.w);
  const [kI, setKI] = useState(FIG1_DEFAULT.kI);
  const [tau, setTau] = useState(FIG1_DEFAULT.tau);
  const [rE0, setRE0] = useState(FIG1_DEFAULT.rE0);
  const [rI0, setRI0] = useState(FIG1_DEFAULT.rI0);

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
      tEnd: 5,
    });
    return {
      traj,
      wFF: w * (1 + kI),
      wPlus: w * (kI - 1),
      lambda: -w * (kI - 1),
    };
  }, [w, kI, tau, rE0, rI0]);

  const series = useMemo(() => {
    const E = traj.r.map((r, i) => [traj.t[i], r[0]] as [number, number]);
    const I = traj.r.map((r, i) => [traj.t[i], r[1]] as [number, number]);
    const sum = traj.r.map((r, i) => [traj.t[i], 0.5 * (r[0] + r[1])] as [number, number]);
    const diff = traj.r.map((r, i) => [traj.t[i], 0.5 * (r[0] - r[1])] as [number, number]);
    return [
      { label: "rE (excitatory)", color: "#16a34a", data: E },
      { label: "rI (inhibitory)", color: "#dc2626", data: I },
      { label: "r+ (sum)", color: "#2563eb", data: sum },
      { label: "r− (difference)", color: "#000000", data: diff },
    ];
  }, [traj]);

  return (
    <FigPanel
      figNumber={1}
      title="The two-population balanced circuit"
      controls={
        <>
          <Slider label="w (recurrent strength)" value={w} min={0} max={10} step={0.05} onChange={setW} />
          <Slider label="kI (inhibition ratio)" value={kI} min={1} max={3} step={0.01} onChange={setKI} />
          <Slider label="τ (time constant)" value={tau} min={0.1} max={3} step={0.05} onChange={setTau} unit="" />
          <Slider label="rE(0)" value={rE0} min={-1} max={1} step={0.01} onChange={setRE0} />
          <Slider label="rI(0)" value={rI0} min={-1} max={1} step={0.01} onChange={setRI0} />
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
          A pulse of activity in the excitatory population (rE(0)=1, rI(0)=0) drives a transient sum-mode response.
          Try increasing <Eq>{"w"}</Eq> with <Eq>{"k_I"}</Eq> just above 1: the pulse grows much larger,
          but its <em>timescale doesn't change</em>. That is balanced amplification.
        </>
      }
    >
      <div className="space-y-2">
        <TimeSeriesPlot series={series} yLabel="firing rate" />
        <div className="grid grid-cols-3 gap-2 rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
          <div>
            <div className="text-zinc-500">Feedforward weight</div>
            <div className="mt-1 font-mono"><Eq>{`w_{FF} = w(1+k_I) = ${wFF.toFixed(3)}`}</Eq></div>
          </div>
          <div>
            <div className="text-zinc-500">Sum self-weight</div>
            <div className="mt-1 font-mono"><Eq>{`w_+ = w(k_I-1) = ${wPlus.toFixed(3)}`}</Eq></div>
          </div>
          <div>
            <div className="text-zinc-500">Non-zero eigenvalue</div>
            <div className="mt-1 font-mono"><Eq>{`\\lambda = ${lambda.toFixed(3)}`}</Eq></div>
          </div>
        </div>
      </div>
    </FigPanel>
  );
}
