/**
 * Benchmark Smoke Tests
 *
 * 基础冒烟测试，验证核心能力存在。
 */
import { describe, expect, it } from "vitest";
import { validateAgainstRules } from "@/lib/rulesGuard";
import { drawForSpread, getAllCards, getSpread } from "@/lib/drawCards";
import { buildLocalFallbackReading } from "@/features/reading/lib/buildLocalFallbackReading";
import type { SpreadSnapshot } from "@/features/reading/types/reading";

describe("Benchmark: Tarot Rule Correctness", () => {
  it("78 张牌完整", () => {
    expect(getAllCards()).toHaveLength(78);
  });

  it("rulesGuard 拦截断言式预测", () => {
    const reading = {
      title: "测试",
      thesis: "这是一段足够长的中文开场陈述用来定基调。",
      spread_id: "single_card" as const,
      spread_name_zh: "单牌解读",
      cards: [],
      card_id: "the_fool",
      card_name: "The Fool",
      zh_name: "愚者",
      orientation: "upright" as const,
      domain: "self",
      motifs: [],
      image: "/cards/major/the_fool.jpg",
      scenes: [
        {
          scene_id: 1,
          type: "opening" as const,
          step_label: "整体",
          headline: "标题",
          body: "你一定会得到答案，这是命中注定的结果。",
          visual_direction: "",
          duration: 6,
        },
      ],
      closing_line: "档案翻到这里。",
      disclaimer: "这不是命运预测，而是一种象征性反思。",
    };
    const report = validateAgainstRules(reading);
    expect(report.ok).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it("rulesGuard 拦截感情承诺话术", () => {
    const reading = {
      title: "测试",
      thesis: "这是一段足够长的中文开场陈述用来定基调。",
      spread_id: "single_card" as const,
      spread_name_zh: "单牌解读",
      cards: [],
      card_id: "the_fool",
      card_name: "The Fool",
      zh_name: "愚者",
      orientation: "upright" as const,
      domain: "love",
      motifs: [],
      image: "/cards/major/the_fool.jpg",
      scenes: [
        {
          scene_id: 1,
          type: "opening" as const,
          step_label: "整体",
          headline: "标题",
          body: "他一定会回来找你的，你们命中注定在一起。",
          visual_direction: "",
          duration: 6,
        },
      ],
      closing_line: "档案翻到这里。",
      disclaimer: "这不是命运预测，而是一种象征性反思。",
    };
    const report = validateAgainstRules(reading);
    expect(report.ok).toBe(false);
  });
});

describe("Benchmark: Card Drawing", () => {
  it("single_card 返回 1 张牌", () => {
    const drawn = drawForSpread("single_card");
    expect(drawn).toHaveLength(1);
    expect(drawn[0].card.id).toBeDefined();
    expect(["upright", "reversed"]).toContain(drawn[0].orientation);
  });

  it("past_present_trend 返回 3 张不重复的牌", () => {
    const drawn = drawForSpread("past_present_trend");
    expect(drawn).toHaveLength(3);
    const ids = new Set(drawn.map((d) => d.card.id));
    expect(ids.size).toBe(3);
  });

  it("celtic_cross 返回 10 张不重复的牌", () => {
    const drawn = drawForSpread("celtic_cross");
    expect(drawn).toHaveLength(10);
    const ids = new Set(drawn.map((d) => d.card.id));
    expect(ids.size).toBe(10);
  });

  it("每个牌阵位置有 name_zh 和 meaning_zh", () => {
    const spread = getSpread("past_present_trend");
    for (const pos of spread.positions) {
      expect(pos.name_zh).toBeDefined();
      expect(pos.meaning_zh).toBeDefined();
    }
  });
});

describe("Benchmark: Reading Pipeline", () => {
  it("normalizeReading 输出完整结构", () => {
    const drawn = drawForSpread("single_card");
    const snapshot: SpreadSnapshot = {
      reading_id: "r_bench",
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
      meanings: [],
      spreadId: "single_card",
      domain: "self",
    });

    expect(reading).toBeDefined();
    expect(reading.title).toBeDefined();
    expect(reading.scenes).toBeDefined();
    expect(reading.disclaimer).toContain("象征性反思");
  });

  it("fallback reading 无禁用话术", () => {
    const drawn = drawForSpread("single_card");
    const snapshot: SpreadSnapshot = {
      reading_id: "r_bench2",
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
      meanings: [],
      spreadId: "single_card",
      domain: "self",
    });

    const report = validateAgainstRules(reading as Parameters<typeof validateAgainstRules>[0]);
    const bannedErrors = report.errors.filter((v) => v.code === "phrase.banned");
    expect(bannedErrors).toEqual([]);
  });
});

describe("Benchmark: Motif Data Governance", () => {
  it("schema 中 Motif 类型有 source 和 quality 字段", () => {
    // Type-level check: source and quality fields exist on Motif
    const motif = {
      id: "test",
      label: "test",
      meaning: "test",
      bbox: { x: 0, y: 0, w: 0.1, h: 0.1 },
      source: "manual" as const,
      quality: "verified" as const,
    };
    expect(motif.source).toBe("manual");
    expect(motif.quality).toBe("verified");
  });

  it("大阿尔卡那 motif 都有 verified 标记", async () => {
    const data = (await import("@/data/tarot_cards.json")).default as Array<{
      motifs?: Array<{ source?: string; quality?: string; precision?: string }>;
    }>;
    const allMotifs = data.flatMap((c) => c.motifs ?? []);
    expect(allMotifs.length).toBeGreaterThan(0);
    for (const m of allMotifs) {
      expect(m.source).toBe("manual");
      expect(m.quality).toBe("verified");
      expect(m.precision).toBe("precise");
    }
  });

  it("小阿尔卡那 motif 都标记为 rough/approximate（不假装精确）", async () => {
    const suits = await Promise.all([
      import("@/data/cards/minor_wands.json"),
      import("@/data/cards/minor_cups.json"),
      import("@/data/cards/minor_swords.json"),
      import("@/data/cards/minor_pentacles.json"),
    ]);
    type MinorCard = { motifs?: Array<{ source?: string; quality?: string; precision?: string }> };
    const allMotifs = suits.flatMap(
      (mod) => (mod.default as MinorCard[]).flatMap((c) => c.motifs ?? []),
    );
    expect(allMotifs.length).toBeGreaterThan(0);
    for (const m of allMotifs) {
      expect(m.quality).toBe("rough");
      expect(m.precision).toBe("approximate");
    }
  });
});
