import { describe, expect, it } from "vitest";
import { buildMotifConnectorPath } from "@/lib/motifConnectorPath";

describe("buildMotifConnectorPath", () => {
  it("builds a cubic path from anchor to left note edge", () => {
    const d = buildMotifConnectorPath(
      { anchorX: 200, anchorY: 100, noteX: 80, noteY: 120 },
      "left",
    );
    expect(d).toMatch(/^M 200 100 C/);
    expect(d).toContain("80 120");
  });

  it("builds a path to right note left edge", () => {
    const d = buildMotifConnectorPath(
      { anchorX: 200, anchorY: 100, noteX: 420, noteY: 140 },
      "right",
    );
    expect(d).toContain("420 140");
  });
});
