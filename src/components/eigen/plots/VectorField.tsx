import { useRef, useState } from "react";

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
import type { Matrix2x2 } from "@/components/eigen/math/eig2x2";

type Props = {
  W: Matrix2x2;
  trajectory?: [number, number][];
  x0?: [number, number];
  onDragX0?: (next: [number, number]) => void;
  width?: number;
  height?: number;
  range?: [number, number];
};

const PAD = 28;
const GRID = 13;

export default function VectorField({
  W, trajectory, x0, onDragX0, width = 280, height = 280, range = [-2, 2],
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const sx = (x: number) =>
    PAD + ((x - range[0]) / (range[1] - range[0])) * (width - 2 * PAD);
  const sy = (y: number) =>
    height - PAD - ((y - range[0]) / (range[1] - range[0])) * (height - 2 * PAD);
  const invX = (px: number) =>
    range[0] + ((px - PAD) / (width - 2 * PAD)) * (range[1] - range[0]);
  const invY = (py: number) =>
    range[0] + ((height - PAD - py) / (height - 2 * PAD)) * (range[1] - range[0]);

  const arrows: React.ReactNode[] = [];
  const step = (range[1] - range[0]) / (GRID - 1);
  let maxMag = 0;
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const x = range[0] + i * step;
      const y = range[0] + j * step;
      const dx = W[0][0] * x + W[0][1] * y;
      const dy = W[1][0] * x + W[1][1] * y;
      maxMag = Math.max(maxMag, Math.hypot(dx, dy));
    }
  }
  const scale = maxMag > 0 ? (step * 0.45) / maxMag : 0;
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const x = range[0] + i * step;
      const y = range[0] + j * step;
      const dx = W[0][0] * x + W[0][1] * y;
      const dy = W[1][0] * x + W[1][1] * y;
      const x2 = x + dx * scale;
      const y2 = y + dy * scale;
      arrows.push(
        <line
          key={`${i}-${j}`}
          x1={sx(x)} y1={sy(y)} x2={sx(x2)} y2={sy(y2)}
          stroke="currentColor" strokeOpacity={0.55} strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />,
      );
    }
  }

  const trajPath = trajectory && trajectory.length > 1
    ? trajectory.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0])} ${sy(p[1])}`).join(" ")
    : null;

  return (
    <svg
      ref={svgRef}
      width={width} height={height}
      className="touch-none select-none"
      onPointerMove={(e) => {
        if (!dragging || !svgRef.current || !onDragX0) return;
        const r = svgRef.current.getBoundingClientRect();
        onDragX0([invX(e.clientX - r.left), invY(e.clientY - r.top)]);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="currentColor" opacity="0.55" />
        </marker>
      </defs>
      <rect x={PAD} y={PAD} width={width - 2 * PAD} height={height - 2 * PAD}
        fill="none" stroke="currentColor" strokeOpacity={0.25} />
      <line x1={PAD} y1={sy(0)} x2={width - PAD} y2={sy(0)} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={height - PAD} stroke="currentColor" strokeOpacity={0.2} />
      {niceTicks(range[0], range[1], 5).map((v) => (
        <g key={`xt-${v}`} transform={`translate(${sx(v)}, ${height - PAD})`}>
          <line y1={0} y2={3} stroke="currentColor" strokeOpacity={0.4} />
          <text y={13} fontSize={9} textAnchor="middle" fill="currentColor" opacity={0.55}>{fmtTick(v)}</text>
        </g>
      ))}
      {niceTicks(range[0], range[1], 5).map((v) => (
        <g key={`yt-${v}`} transform={`translate(${PAD}, ${sy(v)})`}>
          <line x1={-3} x2={0} stroke="currentColor" strokeOpacity={0.4} />
          <text x={-5} y={3} fontSize={9} textAnchor="end" fill="currentColor" opacity={0.55}>{fmtTick(v)}</text>
        </g>
      ))}
      {arrows}
      {trajPath && (
        <path d={trajPath} stroke="rgb(167,139,250)" strokeWidth={2} fill="none" />
      )}
      {x0 && (
        <circle
          cx={sx(x0[0])} cy={sy(x0[1])} r={7}
          fill="rgb(124,58,237)" stroke="white" strokeWidth={2}
          style={{ cursor: onDragX0 ? "grab" : "default" }}
          onPointerDown={(e) => {
            if (!onDragX0) return;
            e.preventDefault();
            setDragging(true);
          }}
        />
      )}
    </svg>
  );
}
