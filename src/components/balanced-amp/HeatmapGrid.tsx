import { useEffect, useRef } from "react";

interface Props {
  /** Row-major flat array length rows*cols. */
  values: Float32Array | number[];
  rows: number;
  cols: number;
  /** Pixel size of each cell on screen. */
  cellPx?: number;
  /** [min, max] for color mapping. If null, computed from values. */
  vRange?: [number, number] | null;
  /** Diverging colormap: blue (negative) → white (0) → red (positive). */
  colormap?: "diverging" | "viridis";
  onCellClick?: (row: number, col: number) => void;
  className?: string;
}

export function HeatmapGrid({
  values,
  rows,
  cols,
  cellPx = 10,
  vRange = null,
  colormap = "diverging",
  onCellClick,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let vMin: number, vMax: number;
    if (vRange) {
      [vMin, vMax] = vRange;
    } else {
      vMin = Infinity;
      vMax = -Infinity;
      for (let i = 0; i < values.length; i++) {
        if (values[i] < vMin) vMin = values[i];
        if (values[i] > vMax) vMax = values[i];
      }
    }
    const vAbs = Math.max(Math.abs(vMin), Math.abs(vMax)) || 1;

    const imageData = ctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = values[r * cols + c];
        const [R, G, B] = colormap === "diverging" ? divergingRGB(v / vAbs) : viridisRGB((v - vMin) / (vMax - vMin || 1));
        const idx = (r * cols + c) * 4;
        imageData.data[idx] = R;
        imageData.data[idx + 1] = G;
        imageData.data[idx + 2] = B;
        imageData.data[idx + 3] = 255;
      }
    }
    const off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    off.getContext("2d")!.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  }, [values, rows, cols, vRange, colormap]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * cols;
    const y = ((e.clientY - rect.top) / rect.height) * rows;
    onCellClick(Math.floor(y), Math.floor(x));
  };

  return (
    <canvas
      ref={canvasRef}
      width={cols * cellPx}
      height={rows * cellPx}
      onClick={handleClick}
      className={className}
      style={{ imageRendering: "pixelated", cursor: onCellClick ? "crosshair" : "default" }}
    />
  );
}

/** Diverging blue-white-red colormap. Input in [-1, 1]. */
function divergingRGB(t: number): [number, number, number] {
  t = Math.max(-1, Math.min(1, t));
  if (t >= 0) {
    return [255, Math.round(255 * (1 - t)), Math.round(255 * (1 - t))];
  } else {
    return [Math.round(255 * (1 + t)), Math.round(255 * (1 + t)), 255];
  }
}

/** Cheap viridis-ish colormap. Input in [0, 1]. */
function viridisRGB(t: number): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  const r = Math.round(255 * Math.max(0, Math.min(1, -0.05 + 2.0 * t - 1.2 * t * t)));
  const g = Math.round(255 * Math.max(0, Math.min(1, 0.0 + 1.6 * t - 0.5 * t * t)));
  const b = Math.round(255 * Math.max(0, Math.min(1, 0.4 + 0.7 * t - 1.1 * t * t)));
  return [r, g, b];
}
