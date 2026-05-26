/**
 * Reading Session 集成测试
 *
 * 模拟完整的 reading 流程：选择模式 → 输入问题 → 抽牌 → 生成解读
 */
import { describe, expect, it } from "vitest";
import { validateAgainstRules } from "@/lib/rulesGuard";
import { drawForSpread } from "@/lib/drawCards";
import { buildLocalFallbackReading } from "@/features/reading/lib/buildLocalFallbackReading";
import type { LocalCardMeaning, SpreadSnapshot } from "@/features/reading/types/reading";

// Mock data
const MEANINGS: LocalCardMeaning[] = [
  {
    card_id: "the_fool",
    name_zh: "愚者",
    orientation: "upright",
    keywords: ["新的开始", "天真"],
    meaning: "愚者代表新的开始，象征天真与冒险精神。",
  },
];

describe("reading session integration", () => {
  it("完整单牌流程：抽牌 → 构建 → 校验", () => {
    // Step 1: 抽牌
    const drawn = drawForSpread("single_card");
    expect(drawn).toHaveLength(1);

    // Step 2: 构建 SpreadSnapshot
    const snapshot: SpreadSnapshot = {
      reading_id: "r_test",
      spread_id: "single_card",
      spread_name_zh: "单牌解读",
      drawn_cards: drawn.map((dc, i) => ({
        position_index: i,
        position_name_zh: dc.position.name_zh,
        card_id: dc.card.id,
        card_name_zh: dc.card.name_zh,
        card_name_en: dc.card.name_en,
        orientation: dc.orientation,
        orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
        image: dc.card.image,
      })),
    };

    // Step 3: 构建本地 fallback reading
    const reading = buildLocalFallbackReading({
      draw: snapshot,
      meanings: MEANINGS,
      spreadId: "single_card",
      domain: "self",
    });

    expect(reading.title).toBeDefined();
    expect(reading.scenes.length).toBeGreaterThan(0);
    expect(reading.disclaimer).toContain("象征性反思");
  });

  it("多牌流程：三牌牌阵 → 构建 → 校验", () => {
    const drawn = drawForSpread("past_present_trend");
    expect(drawn).toHaveLength(3);

    const snapshot: SpreadSnapshot = {
      reading_id: "r_multi",
      spread_id: "past_present_trend",
      spread_name_zh: "时间之河",
      drawn_cards: drawn.map((dc, i) => ({
        position_index: i,
        position_name_zh: dc.position.name_zh,
        card_id: dc.card.id,
        card_name_zh: dc.card.name_zh,
        card_name_en: dc.card.name_en,
        orientation: dc.orientation,
        orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
        image: dc.card.image,
      })),
    };

    const reading = buildLocalFallbackReading({
      draw: snapshot,
      meanings: [],
      spreadId: "past_present_trend",
      domain: "self",
    });

    expect(reading.cards).toHaveLength(3);
    expect(reading.scenes).toHaveLength(3);
  });

  it("fallback reading 通过 rulesGuard 基本检查", () => {
    const drawn = drawForSpread("single_card");
    const snapshot: SpreadSnapshot = {
      reading_id: "r_guard",
      spread_id: "single_card",
      spread_name_zh: "单牌解读",
      drawn_cards: drawn.map((dc, i) => ({
        position_index: i,
        position_name_zh: dc.position.name_zh,
        card_id: dc.card.id,
        card_name_zh: dc.card.name_zh,
        card_name_en: dc.card.name_en,
        orientation: dc.orientation,
        orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
        image: dc.card.image,
      })),
    };

    const reading = buildLocalFallbackReading({
      draw: snapshot,
      meanings: MEANINGS,
      spreadId: "single_card",
      domain: "self",
    });

    // The fallback reading should not have banned phrases
    const report = validateAgainstRules(reading as Parameters<typeof validateAgainstRules>[0]);
    const bannedErrors = report.errors.filter((v) => v.code === "phrase.banned");
    expect(bannedErrors).toEqual([]);
  });
});
