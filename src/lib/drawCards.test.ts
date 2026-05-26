import { describe, expect, it } from "vitest";
import {
  drawForSpread,
  findCard,
  getAllCards,
  getSpread,
} from "./drawCards";
import type { SpreadId } from "./schema";

describe("getAllCards", () => {
  it("返回完整 78 张牌", () => {
    expect(getAllCards()).toHaveLength(78);
  });

  it("所有牌 id 唯一", () => {
    const ids = getAllCards().map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(78);
  });
});

describe("findCard", () => {
  it("已知 id 返回对应牌", () => {
    const fool = findCard("major_00_fool");
    expect(fool).toBeDefined();
    expect(fool?.name_zh).toBe("愚人");
  });

  it("未知 id 返回 undefined", () => {
    expect(findCard("not_real")).toBeUndefined();
  });
});

describe("getSpread", () => {
  it("已知牌阵返回定义", () => {
    const s = getSpread("single_card");
    expect(s.id).toBe("single_card");
    expect(s.card_count).toBe(1);
  });

  it("未知牌阵抛错", () => {
    expect(() => getSpread("ghost_spread" as SpreadId)).toThrow(/Unknown spread/);
  });
});

describe("drawForSpread", () => {
  it("single_card 返回 1 张牌", () => {
    const drawn = drawForSpread("single_card");
    expect(drawn).toHaveLength(1);
    expect(drawn[0].position.index).toBe(1);
  });

  it("past_present_trend 返回 3 张牌且 position 正确", () => {
    const drawn = drawForSpread("past_present_trend");
    expect(drawn).toHaveLength(3);
    drawn.forEach((dc, i) => {
      expect(dc.position_index).toBe(i);
      expect(["upright", "reversed"]).toContain(dc.orientation);
    });
  });

  it("celtic_cross 返回 10 张不重复的牌", () => {
    const drawn = drawForSpread("celtic_cross");
    expect(drawn).toHaveLength(10);
    const ids = drawn.map((dc) => dc.card.id);
    expect(new Set(ids).size).toBe(10);
  });
});
