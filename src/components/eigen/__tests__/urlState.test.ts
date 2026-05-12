import { describe, expect, it } from "vitest";
import { encodeFig2, decodeFig2 } from "@/components/eigen/math/urlState";

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
