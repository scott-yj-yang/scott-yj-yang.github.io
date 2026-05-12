import type { Matrix2x2 } from "@/components/eigen/math/eig2x2";

type Props = {
  W: Matrix2x2;
  precision?: number;
  highlight?: "diagonal" | "off-diagonal" | "lower-tri" | null;
  caption?: string;
};

export default function MatrixReadout({
  W, precision = 2, highlight = null, caption,
}: Props) {
  const fmt = (v: number) => v.toFixed(precision);
  const isHighlighted = (i: number, j: number) => {
    if (highlight === "diagonal") return i === j;
    if (highlight === "off-diagonal") return i !== j;
    if (highlight === "lower-tri") return i > j;
    return false;
  };
  const cell = (i: number, j: number) => (
    <td
      key={`${i}-${j}`}
      className={`px-3 py-1 font-mono text-sm tabular-nums text-right ${
        isHighlighted(i, j) ? "bg-accent/15 text-accent-dark dark:text-accent-light" : ""
      }`}
    >
      {fmt(W[i][j])}
    </td>
  );

  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex items-stretch">
        <div className="border-l-2 border-y-2 border-current w-2" />
        <table className="border-collapse">
          <tbody>
            <tr>{cell(0, 0)}{cell(0, 1)}</tr>
            <tr>{cell(1, 0)}{cell(1, 1)}</tr>
          </tbody>
        </table>
        <div className="border-r-2 border-y-2 border-current w-2" />
      </div>
      {caption && <div className="text-xs mt-1 text-zinc-500">{caption}</div>}
    </div>
  );
}
