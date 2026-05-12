import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

export function Eq({ children, block = false }: { children: string; block?: boolean }) {
  return block ? <BlockMath math={children} /> : <InlineMath math={children} />;
}
