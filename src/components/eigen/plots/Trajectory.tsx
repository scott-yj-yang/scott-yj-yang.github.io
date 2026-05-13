function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const rough = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step: number;
  if (norm < 1.5) step = mag;
  else if (norm < 3) step = 2 * mag;
  else if (norm < 7) step = 5 * mag;
  else step = 10 * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return ticks;
}

function fmtTick(v: number): string {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 1) return v.toFixed(1).replace(/\.0$/, "");
  return v.toFixed(2);
}

type Series = { values: number[]; color: string; label?: string };

type Props = {
  series: Series[];
  dt: number;
  width?: number;
  height?: number;
  yRange?: [number, number];
};

const PAD = 28;

export default function Trajectory({
  series, dt, width = 280, height = 200, yRange,
}: Props) {
  const n = series[0]?.values.length ?? 0;
  if (n === 0) return <svg width={width} height={height} />;
  const tMax = (n - 1) * dt;
  let yMin: number, yMax: number;
  if (yRange) {
    [yMin, yMax] = yRange;
  } else {
    let lo = Infinity, hi = -Infinity;
    for (const s of series) for (const v of s.values) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
    const span = Math.max(hi - lo, 1e-6);
    yMin = lo - 0.05 * span;
    yMax = hi + 0.05 * span;
  }

  const xScale = (t: number) => PAD + (t / Math.max(tMax, 1e-9)) * (width - 2 * PAD);
  const yScale = (v: number) =>
    height - PAD - ((v - yMin) / (yMax - yMin)) * (height - 2 * PAD);

  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i * dt)} ${yScale(v)}`).join(" ");

  return (
    <svg width={width} height={height}>
      {yMin <= 0 && 0 <= yMax && (
        <line x1={PAD} y1={yScale(0)} x2={width - PAD} y2={yScale(0)}
              stroke="currentColor" strokeOpacity={0.15} />
      )}
      <line x1={PAD} y1={height - PAD} x2={width - PAD} y2={height - PAD} stroke="currentColor" strokeOpacity={0.4} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={height - PAD} stroke="currentColor" strokeOpacity={0.4} />
      <text x={width - PAD} y={height - 6} fontSize={10} textAnchor="end" fill="currentColor" opacity={0.6}>time</text>
      {niceTicks(0, tMax, 5).map((v) => (
        <g key={`xt-${v}`} transform={`translate(${xScale(v)}, ${height - PAD})`}>
          <line y1={0} y2={3} stroke="currentColor" strokeOpacity={0.4} />
          <text y={13} fontSize={9} textAnchor="middle" fill="currentColor" opacity={0.55}>{fmtTick(v)}</text>
        </g>
      ))}
      {niceTicks(yMin, yMax, 4).map((v) => (
        <g key={`yt-${v}`} transform={`translate(${PAD}, ${yScale(v)})`}>
          <line x1={-3} x2={0} stroke="currentColor" strokeOpacity={0.4} />
          <text x={-5} y={3} fontSize={9} textAnchor="end" fill="currentColor" opacity={0.55}>{fmtTick(v)}</text>
        </g>
      ))}
      {series.map((s, i) => (
        <path key={i} d={path(s.values)} stroke={s.color} fill="none" strokeWidth={1.6} />
      ))}
    </svg>
  );
}
