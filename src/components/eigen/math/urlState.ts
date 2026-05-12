export type Fig2Mode = "real" | "complex";
export type Fig2State = {
  mode: Fig2Mode;
  lambda1: { re: number; im: number };
  lambda2: { re: number; im: number };
  theta: number;
  x0: [number, number];
};

/** Round a number to 4 decimals and emit a compact string (no trailing zeros). */
const r = (x: number) => Number(x.toFixed(4)).toString();

export function encodeFig2(s: Fig2State): string {
  return [
    s.mode,
    r(s.lambda1.re), r(s.lambda1.im),
    r(s.lambda2.re), r(s.lambda2.im),
    r(s.theta),
    r(s.x0[0]), r(s.x0[1]),
  ].join(",");
}

export function decodeFig2(raw: string | null): Fig2State | null {
  if (!raw) return null;
  const parts = raw.split(",");
  if (parts.length !== 8) return null;
  const [mode, l1r, l1i, l2r, l2i, theta, x0a, x0b] = parts;
  if (mode !== "real" && mode !== "complex") return null;
  const nums = [l1r, l1i, l2r, l2i, theta, x0a, x0b].map(Number);
  if (nums.some((n) => Number.isNaN(n))) return null;
  return {
    mode,
    lambda1: { re: nums[0], im: nums[1] },
    lambda2: { re: nums[2], im: nums[3] },
    theta: nums[4],
    x0: [nums[5], nums[6]],
  };
}

/** Read a single query parameter from `window.location`. Safe on the server (returns null). */
export function readQuery(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

/** Write or delete a single query parameter via history.replaceState. No-op on the server. */
export function writeQuery(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  window.history.replaceState(null, "", url.toString());
}
