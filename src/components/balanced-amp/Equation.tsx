import "katex/dist/katex.min.css";
import katex from "katex";
import { useMemo } from "react";

interface Props {
  children: string;
  block?: boolean;
}

export function Eq({ children, block = false }: Props) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        displayMode: block,
        throwOnError: false,
        output: "html",
      }),
    [children, block]
  );
  const Tag = block ? "div" : "span";
  return (
    <Tag
      className={block ? "katex-display" : "katex-inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
