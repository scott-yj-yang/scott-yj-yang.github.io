import { useRef, useState } from "react";
import type { Matrix2x2 } from "@/components/eigen/math/eig2x2";

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

type Props = {
  W: Matrix2x2;
  trajectory?: [number, number][];
  x0?: [number, number];
  onDragX0?: (next: [number, number]) => void;
  width?: number;
  height?: number;
  range?: [number, number];
  xLabel?: string;
  yLabel?: string;
  title?: string;
};

const PAD_TOP = 22;
const PAD_BOTTOM = 38;
const PAD_LEFT = 42;
const PAD_RIGHT = 12;
const GRID = 13;

// Sequential colormap for arrow magnitude: slow (cool teal) → fast (warm magenta).
function speedColor(t: number): string {
  t = Math.max(0, Math.min(1, t));
  const stops: Array<{ t: number; rgb: [number, number, number] }> = [
    { t: 0, rgb: [129, 192, 197] },
    { t: 0.5, rgb: [124, 58, 237] },
    { t: 1, rgb: [219, 39, 119] },
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      const f = (t - stops[i].t) / (stops[i + 1].t - stops[i].t);
      const r = Math.round(stops[i].rgb[0] + (stops[i + 1].rgb[0] - stops[i].rgb[0]) * f);
      const g = Math.round(stops[i].rgb[1] + (stops[i + 1].rgb[1] - stops[i].rgb[1]) * f);
      const b = Math.round(stops[i].rgb[2] + (stops[i + 1].rgb[2] - stops[i].rgb[2]) * f);
      return `rgb(${r},${g},${b})`;
    }
  }
  return "rgb(124,58,237)";
}

export default function VectorField({
  W,
  trajectory,
  x0,
  onDragX0,
  width = 280,
  height = 280,
  range = [-2, 2],
  xLabel = "x₁",
  yLabel = "x₂",
  title,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const innerLeft = PAD_LEFT;
  const innerRight = width - PAD_RIGHT;
  const innerTop = PAD_TOP;
  const innerBottom = height - PAD_BOTTOM;
  const innerW = innerRight - innerLeft;
  const innerH = innerBottom - innerTop;

  const sx = (x: number) => innerLeft + ((x - range[0]) / (range[1] - range[0])) * innerW;
  const sy = (y: number) => innerBottom - ((y - range[0]) / (range[1] - range[0])) * innerH;
  const invX = (px: number) => range[0] + ((px - innerLeft) / innerW) * (range[1] - range[0]);
  const invY = (py: number) => range[0] + ((innerBottom - py) / innerH) * (range[1] - range[0]);

  const cellStep = (range[1] - range[0]) / (GRID - 1);
  const cells: { x: number; y: number; dx: number; dy: number; mag: number }[] = [];
  let maxMag = 0;
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const x = range[0] + i * cellStep;
      const y = range[0] + j * cellStep;
      const dx = W[0][0] * x + W[0][1] * y;
      const dy = W[1][0] * x + W[1][1] * y;
      const mag = Math.hypot(dx, dy);
      maxMag = Math.max(maxMag, mag);
      cells.push({ x, y, dx, dy, mag });
    }
  }
  const lengthScale = maxMag > 0 ? (cellStep * 0.55) / maxMag : 0;

  const arrowEls = cells.map((c, idx) => {
    const t = c.mag / Math.max(maxMag, 1e-9);
    const color = speedColor(t);
    // sqrt scaling so even small fields show up; clamp tiny ones to a minimum visible length
    const dispScale = lengthScale * (0.25 + 0.75 * Math.sqrt(t));
    const x2 = c.x + c.dx * dispScale;
    const y2 = c.y + c.dy * dispScale;
    const ax = sx(c.x);
    const ay = sy(c.y);
    const bx = sx(x2);
    const by = sy(y2);
    const angle = Math.atan2(by - ay, bx - ax);
    const tipSize = 5;
    const t1x = bx - tipSize * Math.cos(angle - Math.PI / 6);
    const t1y = by - tipSize * Math.sin(angle - Math.PI / 6);
    const t2x = bx - tipSize * Math.cos(angle + Math.PI / 6);
    const t2y = by - tipSize * Math.sin(angle + Math.PI / 6);
    return (
      <g key={idx}>
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={1.4} strokeOpacity={0.92} />
        <polygon points={`${bx},${by} ${t1x},${t1y} ${t2x},${t2y}`} fill={color} opacity={0.95} />
      </g>
    );
  });

  const trajPath =
    trajectory && trajectory.length > 1
      ? trajectory.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0])} ${sy(p[1])}`).join(" ")
      : null;

  const xTicks = niceTicks(range[0], range[1], 5);
  const yTicks = niceTicks(range[0], range[1], 5);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="touch-none select-none"
      onPointerMove={(e) => {
        if (!dragging || !svgRef.current || !onDragX0) return;
        const r = svgRef.current.getBoundingClientRect();
        onDragX0([invX(e.clientX - r.left), invY(e.clientY - r.top)]);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
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
      <rect x={innerLeft} y={innerTop} width={innerW} height={innerH} fill="none" stroke="currentColor" strokeOpacity={0.25} />
      <line x1={innerLeft} y1={sy(0)} x2={innerRight} y2={sy(0)} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={sx(0)} y1={innerTop} x2={sx(0)} y2={innerBottom} stroke="currentColor" strokeOpacity={0.2} />
      {xTicks.map((v) => (
        <g key={`xt-${v}`} transform={`translate(${sx(v)}, ${innerBottom})`}>
          <line y1={0} y2={3} stroke="currentColor" strokeOpacity={0.4} />
          <text y={13} fontSize={9} textAnchor="middle" fill="currentColor" opacity={0.55}>
            {fmtTick(v)}
          </text>
        </g>
      ))}
      {yTicks.map((v) => (
        <g key={`yt-${v}`} transform={`translate(${innerLeft}, ${sy(v)})`}>
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
      {arrowEls}
      {trajPath && <path d={trajPath} stroke="rgb(244,114,182)" strokeWidth={2.2} fill="none" />}
      {x0 && (
        <circle
          cx={sx(x0[0])}
          cy={sy(x0[1])}
          r={7}
          fill="rgb(124,58,237)"
          stroke="white"
          strokeWidth={2}
          style={{ cursor: onDragX0 ? "grab" : "default" }}
          onPointerDown={(e) => {
            if (!onDragX0) return;
            e.preventDefault();
            setDragging(true);
          }}
        />
      )}
      {/* speed legend */}
      <g transform={`translate(${innerRight - 96}, ${innerTop + 2})`}>
        <text x={0} y={7} fontSize={9} fill="currentColor" opacity={0.65}>
          slow
        </text>
        {Array.from({ length: 14 }, (_, k) => {
          const t = k / 13;
          return <rect key={k} x={26 + k * 4} y={2} width={4} height={8} fill={speedColor(t)} />;
        })}
        <text x={84} y={7} fontSize={9} fill="currentColor" opacity={0.65}>
          fast
        </text>
      </g>
    </svg>
  );
}
