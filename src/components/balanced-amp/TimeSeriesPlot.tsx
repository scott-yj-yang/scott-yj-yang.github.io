import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { useMemo } from "react";

export interface Series {
  label: string;
  color: string;
  /** Array of [t, value]. */
  data: [number, number][];
  dashed?: boolean;
}

interface Props {
  series: Series[];
  width?: number;
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xLabel?: string;
  yLabel?: string;
}

export function TimeSeriesPlot({
  series,
  width = 480,
  height = 240,
  xDomain,
  yDomain,
  xLabel = "t / τ",
  yLabel = "",
}: Props) {
  const margin = { top: 10, right: 12, bottom: 32, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const { x, y, paths, xTicks, yTicks } = useMemo(() => {
    const allData = series.flatMap((s) => s.data);
    const xs = allData.map((d) => d[0]);
    const ys = allData.map((d) => d[1]);
    const xd = xDomain ?? [Math.min(...xs), Math.max(...xs)];
    const yd = yDomain ?? [Math.min(0, ...ys), Math.max(0, ...ys)];
    const x = scaleLinear().domain(xd).range([0, innerW]);
    const y = scaleLinear().domain(yd).range([innerH, 0]).nice();
    const linePath = line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1]));
    return {
      x,
      y,
      paths: series.map((s) => ({ s, d: linePath(s.data) ?? "" })),
      xTicks: x.ticks(5),
      yTicks: y.ticks(5),
    };
  }, [series, innerW, innerH, xDomain, yDomain]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {yTicks.map((t) => (
          <g key={`y${t}`} transform={`translate(0,${y(t)})`}>
            <line x1={0} x2={innerW} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
            <text x={-6} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[10px]">{t}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={`x${t}`} transform={`translate(${x(t)},${innerH})`}>
            <line y1={0} y2={4} stroke="currentColor" className="text-zinc-400" />
            <text y={16} textAnchor="middle" className="fill-zinc-500 text-[10px]">{t}</text>
          </g>
        ))}
        <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="currentColor" className="text-zinc-400" />
        <line x1={0} x2={0} y1={0} y2={innerH} stroke="currentColor" className="text-zinc-400" />
        {paths.map(({ s, d }, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "4 3" : undefined}
          />
        ))}
        <text x={innerW / 2} y={innerH + 28} textAnchor="middle" className="fill-zinc-600 text-[11px] dark:fill-zinc-400">{xLabel}</text>
        {yLabel && (
          <text transform={`translate(-30,${innerH / 2}) rotate(-90)`} textAnchor="middle" className="fill-zinc-600 text-[11px] dark:fill-zinc-400">{yLabel}</text>
        )}
      </g>
      <g transform={`translate(${margin.left + 8},${margin.top + 8})`}>
        {series.map((s, i) => (
          <g key={i} transform={`translate(0, ${i * 14})`}>
            <line x1={0} x2={14} y1={4} y2={4} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? "4 3" : undefined} />
            <text x={20} y={8} className="fill-zinc-700 text-[10px] dark:fill-zinc-300">{s.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
