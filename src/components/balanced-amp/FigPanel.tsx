import type { ReactNode } from "react";

interface Props {
  figNumber: number;
  title: string;
  caption?: ReactNode;
  controls: ReactNode;
  children: ReactNode;
}

export function FigPanel({ figNumber, title, caption, controls, children }: Props) {
  return (
    <figure className="my-12 rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      <figcaption className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Figure {figNumber}</span>
        <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      </figcaption>
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="min-w-0">{children}</div>
        <aside className="flex flex-col gap-4 rounded-lg bg-white p-4 dark:bg-zinc-950">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Parameters</h4>
          {controls}
        </aside>
      </div>
      {caption && (
        <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">{caption}</div>
      )}
    </figure>
  );
}
