import { describe, expect, it } from "vitest";
import { lookupLocalMeaning } from "./lookupLocalMeaning";

describe("lookupLocalMeaning", () => {
  it("已知牌 + upright 返回正位牌义", () => {
    const m = lookupLocalMeaning("major_00_fool", "upright");
    expect(m).not.toBeNull();
    expect(m?.card_id).toBe("major_00_fool");
    expect(m?.name_zh).toBe("愚人");
    expect(m?.orientation).toBe("upright");
    expect(m?.keywords.length).toBeGreaterThan(0);
    expect(m?.meaning.length).toBeGreaterThan(0);
  });

  it("已知牌 + reversed 返回逆位牌义", () => {
    const m = lookupLocalMeaning("major_00_fool", "reversed");
    expect(m).not.toBeNull();
    expect(m?.orientation).toBe("reversed");
  });

  it("upright / reversed 的 meaning 不同", () => {
    const up = lookupLocalMeaning("major_00_fool", "upright");
    const rv = lookupLocalMeaning("major_00_fool", "reversed");
    expect(up?.meaning).not.toBe(rv?.meaning);
  });

  it("未知 id 返回 null", () => {
    expect(lookupLocalMeaning("ghost_card", "upright")).toBeNull();
  });

  it("查找 minor arcana 也工作", () => {
    const m = lookupLocalMeaning("wands_ace", "upright");
    expect(m).not.toBeNull();
  });
});
