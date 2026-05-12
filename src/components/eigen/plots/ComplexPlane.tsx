import { useRef, useState, type PointerEvent } from "react";

export type ComplexPoint = {
  re: number;
  im: number;
  id?: string;
  color?: string;
  draggable?: boolean;
};

type Props = {
  points: ComplexPoint[];
  width?: number;
  height?: number;
  reRange?: [number, number];
  imRange?: [number, number];
  showStabilityLine?: boolean;
  onDrag?: (id: string, next: { re: number; im: number }) => void;
};

const PAD = 28;

export default function ComplexPlane({
  points,
  width = 280,
  height = 280,
  reRange = [-15, 15],
  imRange = [-15, 15],
  showStabilityLine = true,
  onDrag,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const xScale = (re: number) =>
    PAD + ((re - reRange[0]) / (reRange[1] - reRange[0])) * (width - 2 * PAD);
  const yScale = (im: number) =>
    height - PAD - ((im - imRange[0]) / (imRange[1] - imRange[0])) * (height - 2 * PAD);
  const invX = (px: number) =>
    reRange[0] + ((px - PAD) / (width - 2 * PAD)) * (reRange[1] - reRange[0]);
  const invY = (py: number) =>
    imRange[0] + ((height - PAD - py) / (height - 2 * PAD)) * (imRange[1] - imRange[0]);

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!draggingId || !svgRef.current || !onDrag) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    onDrag(draggingId, { re: invX(px), im: invY(py) });
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="touch-none select-none"
      onPointerMove={onPointerMove}
      onPointerUp={() => setDraggingId(null)}
      onPointerLeave={() => setDraggingId(null)}
    >
      <line x1={PAD} y1={yScale(0)} x2={width - PAD} y2={yScale(0)} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={xScale(0)} y1={PAD} x2={xScale(0)} y2={height - PAD} stroke="currentColor" strokeOpacity={0.2} />
      {showStabilityLine && (
        <line
          x1={xScale(0)} y1={PAD} x2={xScale(0)} y2={height - PAD}
          stroke="rgb(124,58,237)" strokeWidth={1.5} strokeDasharray="4 3"
        />
      )}
      <text x={width - PAD} y={yScale(0) - 4} fontSize={10} textAnchor="end" fill="currentColor" opacity={0.5}>real</text>
      <text x={xScale(0) + 4} y={PAD + 8} fontSize={10} fill="currentColor" opacity={0.5}>imag</text>
      {points.map((p, i) => {
        const id = p.id ?? `p${i}`;
        return (
          <circle
            key={id}
            cx={xScale(p.re)} cy={yScale(p.im)}
            r={p.draggable ? 7 : 3.5}
            fill={p.color ?? "rgb(167,139,250)"}
            stroke={p.draggable ? "white" : "none"}
            strokeWidth={p.draggable ? 2 : 0}
            style={{ cursor: p.draggable ? "grab" : "default" }}
            onPointerDown={(e) => {
              if (!p.draggable) return;
              (e.target as Element).setPointerCapture(e.pointerId);
              setDraggingId(id);
            }}
          />
        );
      })}
    </svg>
  );
}
