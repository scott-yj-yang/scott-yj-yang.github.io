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
  xLabel?: string;
  yLabel?: string;
  title?: string;
};

const PAD_TOP = 22;
const PAD_BOTTOM = 38;
const PAD_LEFT = 42;
const PAD_RIGHT = 12;

export default function Trajectory({
  series,
  dt,
  width = 280,
  height = 200,
  yRange,
  xLabel = "time t",
  yLabel = "x(t)",
  title,
}: Props) {
  const n = series[0]?.values.length ?? 0;
  if (n === 0) return <svg width={width} height={height} />;
  const tMax = (n - 1) * dt;

  let yMin: number, yMax: number;
  if (yRange) {
    [yMin, yMax] = yRange;
  } else {
    let lo = Infinity,
      hi = -Infinity;
    for (const s of series)
      for (const v of s.values) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    if (!Number.isFinite(lo)) {
      lo = -1;
      hi = 1;
    }
    const span = Math.max(hi - lo, 1e-6);
    yMin = lo - 0.05 * span;
    yMax = hi + 0.05 * span;
  }

  const innerLeft = PAD_LEFT;
  const innerRight = width - PAD_RIGHT;
  const innerTop = PAD_TOP;
  const innerBottom = height - PAD_BOTTOM;
  const innerW = innerRight - innerLeft;
  const innerH = innerBottom - innerTop;

  const xScale = (t: number) => innerLeft + (t / Math.max(tMax, 1e-9)) * innerW;
  const yScale = (v: number) => innerBottom - ((v - yMin) / (yMax - yMin)) * innerH;

  const pathFor = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i * dt)} ${yScale(v)}`).join(" ");

  const labeled = series.filter((s) => s.label);
  const showLegend = labeled.length > 0;

  return (
    <svg width={width} height={height}>
      {title && (
        <text
          x={(innerLeft + innerRight) / 2}
          y={12}
          fontSize={11}
          fontWeight={600}
          textAnchor="middle"
          fill="currentColor"
          opacity={0.85}
        >
          {title}
        </text>
      )}
      {yMin <= 0 && 0 <= yMax && (
        <line
          x1={innerLeft}
          y1={yScale(0)}
          x2={innerRight}
          y2={yScale(0)}
          stroke="currentColor"
          strokeOpacity={0.15}
        />
      )}
      <line x1={innerLeft} y1={innerBottom} x2={innerRight} y2={innerBottom} stroke="currentColor" strokeOpacity={0.4} />
      <line x1={innerLeft} y1={innerTop} x2={innerLeft} y2={innerBottom} stroke="currentColor" strokeOpacity={0.4} />
      {niceTicks(0, tMax, 5).map((v) => (
        <g key={`xt-${v}`} transform={`translate(${xScale(v)}, ${innerBottom})`}>
          <line y1={0} y2={3} stroke="currentColor" strokeOpacity={0.4} />
          <text y={13} fontSize={9} textAnchor="middle" fill="currentColor" opacity={0.55}>
            {fmtTick(v)}
          </text>
        </g>
      ))}
      {niceTicks(yMin, yMax, 4).map((v) => (
        <g key={`yt-${v}`} transform={`translate(${innerLeft}, ${yScale(v)})`}>
          <line x1={-3} x2={0} stroke="currentColor" strokeOpacity={0.4} />
          <text x={-5} y={3} fontSize={9} textAnchor="end" fill="currentColor" opacity={0.55}>
            {fmtTick(v)}
          </text>
        </g>
      ))}
      <text
        x={(innerLeft + innerRight) / 2}
        y={height - 6}
        fontSize={10}
        textAnchor="middle"
        fill="currentColor"
        opacity={0.75}
      >
        {xLabel}
      </text>
      <text
        transform={`translate(11, ${(innerTop + innerBottom) / 2}) rotate(-90)`}
        fontSize={10}
        textAnchor="middle"
        fill="currentColor"
        opacity={0.75}
      >
        {yLabel}
      </text>
      {series.map((s, i) => (
        <path key={i} d={pathFor(s.values)} stroke={s.color} fill="none" strokeWidth={1.8} />
      ))}
      {showLegend && (
        <g transform={`translate(${innerLeft + 6}, ${innerTop + 2})`}>
          {labeled.map((s, i) => (
            <g key={i} transform={`translate(${i * 70}, 0)`}>
              <line x1={0} x2={14} y1={6} y2={6} stroke={s.color} strokeWidth={2.4} />
              <text x={18} y={9} fontSize={10} fill="currentColor" opacity={0.85}>
                {s.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
