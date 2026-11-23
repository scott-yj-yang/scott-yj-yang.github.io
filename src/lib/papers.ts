import type { CollectionEntry } from "astro:content";

type Paper = CollectionEntry<"papers">;

/**
 * The order papers are listed in, everywhere: newest year first; within a year,
 * by `order` where it is set (lowest first), then newest month first.
 */
export function comparePapers(a: Paper, b: Paper): number {
  return (
    b.data.year - a.data.year ||
    // Both unset gives Infinity - Infinity = NaN, which falls through to the month.
    (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
    (b.data.month ?? 0) - (a.data.month ?? 0)
  );
}
