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
      {series.map((s, i) => (
        <path key={i} d={path(s.values)} stroke={s.color} fill="none" strokeWidth={1.6} />
      ))}
    </svg>
  );
}
