import { describe, expect, it } from "vitest";
import {
  encodeFig2, decodeFig2,
  encodeFig3, decodeFig3,
  encodeFig4, decodeFig4,
  encodeFig5, decodeFig5,
} from "@/components/eigen/math/urlState";

describe("urlState fig2 round-trip", () => {
  it("encodes mode + 4 numbers + theta + x0 to comma list", () => {
    const s = encodeFig2({
      mode: "real",
      lambda1: { re: -10, im: 0 },
      lambda2: { re: -2, im: 0 },
      theta: 0,
      x0: [1, 1],
    });
    expect(s).toBe("real,-10,0,-2,0,0,1,1");
  });

  it("decodes its own output (complex case)", () => {
    const original = {
      mode: "complex" as const,
      lambda1: { re: -1, im: 3.4641 },
      lambda2: { re: -1, im: -3.4641 },
      theta: 0.25,
      x0: [0.5, -0.3] as [number, number],
    };
    const decoded = decodeFig2(encodeFig2(original));
    expect(decoded).not.toBeNull();
    expect(decoded!.mode).toBe("complex");
    expect(decoded!.theta).toBeCloseTo(0.25, 4);
    expect(decoded!.x0[0]).toBeCloseTo(0.5, 4);
  });

  it("returns null on malformed input", () => {
    expect(decodeFig2("garbage")).toBeNull();
    expect(decodeFig2("real,1,2")).toBeNull();
    expect(decodeFig2(null)).toBeNull();
  });

  it("returns null on bad mode", () => {
    expect(decodeFig2("orange,1,0,2,0,0,0,0")).toBeNull();
  });
});

describe("Fig3/4/5 codecs", () => {
  it("Fig3 round-trip", () => {
    const s = { shift: -1.5, mu1: -3, mu2: -0.3, outlier: 0.5 };
    const d = decodeFig3(encodeFig3(s))!;
    expect(d.shift).toBeCloseTo(-1.5, 3);
    expect(d.mu1).toBeCloseTo(-3, 3);
    expect(d.mu2).toBeCloseTo(-0.3, 3);
    expect(d.outlier).toBeCloseTo(0.5, 3);
  });
  it("Fig3 rejects malformed", () => {
    expect(decodeFig3(null)).toBeNull();
    expect(decodeFig3("a,b,c")).toBeNull();
  });
  it("Fig4 round-trip", () => {
    const d = decodeFig4(encodeFig4({ theta: 1.234, pseudo: "matrix-b" }))!;
    expect(d.theta).toBeCloseTo(1.234, 3);
    expect(d.pseudo).toBe("matrix-b");
  });
  it("Fig5 round-trip", () => {
    expect(decodeFig5(encodeFig5({ mode: "ei", N: 200, seed: 42 })))
      .toEqual({ mode: "ei", N: 200, seed: 42 });
  });
});
