import { describe, expect, it } from "vitest";
import { buildLocalFallbackReading } from "./buildLocalFallbackReading";
import type { LocalCardMeaning, SpreadSnapshot } from "../types/reading";

function makeDraw(): SpreadSnapshot {
  return {
    reading_id: "r_1",
    spread_id: "past_present_trend",
    spread_name_zh: "时间之河",
    drawn_cards: [
      {
        position_index: 0,
        position_name_zh: "过去",
        card_id: "the_fool",
        card_name_zh: "愚者",
        card_name_en: "The Fool",
        orientation: "upright",
        orientation_zh: "正位",
        image: "/cards/major/the_fool.jpg",
      },
      {
        position_index: 1,
        position_name_zh: "现在",
        card_id: "the_star",
        card_name_zh: "星星",
        card_name_en: "The Star",
        orientation: "reversed",
        orientation_zh: "逆位",
        image: "/cards/major/the_star.jpg",
      },
    ],
  };
}

const MEANINGS: LocalCardMeaning[] = [
  {
    card_id: "the_fool",
    name_zh: "愚者",
    orientation: "upright",
    keywords: ["新的开始", "天真"],
    meaning: "愚者代表新的开始。",
  },
  {
    card_id: "the_star",
    name_zh: "星星",
    orientation: "reversed",
    keywords: ["希望受阻"],
    meaning: "希望需要时间显现。",
  },
];

describe("buildLocalFallbackReading", () => {
  it("生成完整 ReadingScript 结构", () => {
    const out = buildLocalFallbackReading({
      draw: makeDraw(),
      meanings: MEANINGS,
      spreadId: "past_present_trend",
      domain: "self",
    });

    expect(out.spread_id).toBe("past_present_trend");
    expect(out.spread_name_zh).toBe("时间之河");
    expect(out.cards).toHaveLength(2);
    expect(out.scenes).toHaveLength(2);
    expect(out.title).toContain("愚者");
    expect(out.disclaimer).toContain("象征性反思");
  });

  it("第一幕是 opening，其余是 card_analysis", () => {
    const out = buildLocalFallbackReading({
      draw: makeDraw(),
      meanings: MEANINGS,
      spreadId: "past_present_trend",
      domain: "self",
    });
    expect(out.scenes[0].type).toBe("opening");
    expect(out.scenes[1].type).toBe("card_analysis");
  });

  it("scenes body 取自传入的 meanings", () => {
    const out = buildLocalFallbackReading({
      draw: makeDraw(),
      meanings: MEANINGS,
      spreadId: "past_present_trend",
      domain: "self",
    });
    expect(out.scenes[0].body).toBe("愚者代表新的开始。");
    expect(out.scenes[1].body).toBe("希望需要时间显现。");
  });

  it("空 meanings 时 body 为空但结构保持", () => {
    const out = buildLocalFallbackReading({
      draw: makeDraw(),
      meanings: [],
      spreadId: "past_present_trend",
      domain: "self",
    });
    expect(out.scenes).toHaveLength(2);
    expect(out.scenes[0].body).toBe("");
    expect(out.title).toBe("解读");
  });

  it("空 drawn_cards 时仍返回合法结构", () => {
    const out = buildLocalFallbackReading({
      draw: { ...makeDraw(), drawn_cards: [] },
      meanings: [],
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.cards).toEqual([]);
    expect(out.scenes).toEqual([]);
    expect(out.card_id).toBe("");
  });
});
