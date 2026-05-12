import { useRef, useState } from "react";
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
      <line x1={PAD} y1={sy(0)} x2={width - PAD} y2={sy(0)} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={height - PAD} stroke="currentColor" strokeOpacity={0.2} />
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
