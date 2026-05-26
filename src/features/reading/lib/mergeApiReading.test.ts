import { describe, expect, it } from "vitest";
import { mergeApiReading } from "./mergeApiReading";
import type {
  ApiReadingResponse,
  SpreadSnapshot,
} from "../types/reading";

function makeDraw(overrides: Partial<SpreadSnapshot> = {}): SpreadSnapshot {
  return {
    reading_id: "reading_123",
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    drawn_cards: [
      {
        position_index: 0,
        position_name_zh: "整体",
        card_id: "the_fool",
        card_name_zh: "愚者",
        card_name_en: "The Fool",
        orientation: "upright",
        orientation_zh: "正位",
        image: "/cards/major/the_fool.jpg",
      },
    ],
    ...overrides,
  };
}

describe("mergeApiReading", () => {
  it("正常映射 API → ReadingScript", () => {
    const api: ApiReadingResponse = {
      title_zh: "新的开始",
      opening_zh: "这是一段开场。",
      closing_line_zh: "档案翻完。",
      disclaimer_zh: "象征性反思。",
      position_readings: [
        {
          position_index: 0,
          position_name_zh: "整体",
          headline_zh: "整张牌的气质",
          body_zh: "充满潜力。",
          scenes: [
            {
              type: "card_analysis",
              headline_zh: "白玫瑰",
              body_zh: "纯粹意图。",
              focus_motif: "m1",
              annotation_label_zh: "纯粹意图",
            },
          ],
        },
      ],
      cards: [
        {
          position_index: 0,
          card_id: "the_fool",
          motifs: [
            { id: "m1", label: "白玫瑰", meaning: "纯粹", bbox: { x: 0, y: 0, w: 1, h: 1 } },
          ],
        },
      ],
    };

    const out = mergeApiReading({
      api,
      draw: makeDraw(),
      spreadId: "single_card",
      domain: "self",
    });

    expect(out.title).toBe("新的开始");
    expect(out.thesis).toBe("这是一段开场。");
    expect(out.spread_id).toBe("single_card");
    expect(out.spread_name_zh).toBe("单牌解读");
    expect(out.cards).toHaveLength(1);
    expect(out.cards[0].card_id).toBe("the_fool");
    expect(out.cards[0].motifs).toHaveLength(1);
    expect(out.scenes).toHaveLength(1);
    expect(out.scenes[0].focus_motif).toBe("m1");
    expect(out.scenes[0].step_label).toBe("整体");
  });

  it("缺少 position_readings 时退化为空 scenes", () => {
    const out = mergeApiReading({
      api: {},
      draw: makeDraw(),
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.scenes).toEqual([]);
    expect(out.title).toBe("");
  });

  it("position 没有 scenes 时生成 opening 兜底", () => {
    const out = mergeApiReading({
      api: {
        position_readings: [
          {
            position_index: 0,
            position_name_zh: "整体",
            headline_zh: "标题",
            body_zh: "正文。",
          },
        ],
      },
      draw: makeDraw(),
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.scenes).toHaveLength(1);
    expect(out.scenes[0].type).toBe("opening");
    expect(out.scenes[0].headline).toBe("标题");
    expect(out.scenes[0].body).toBe("正文。");
  });

  it("disclaimer 默认值", () => {
    const out = mergeApiReading({
      api: {},
      draw: makeDraw(),
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.disclaimer).toContain("象征性反思");
  });

  it("spread_analysis 缺 element_balance 时补默认值", () => {
    const out = mergeApiReading({
      api: {
        spread_analysis: {
          major_arcana_count: 1,
          suit_counts: { wands: 0 },
          reversal_count: 0,
          relationship_notes: [],
        },
      },
      draw: makeDraw(),
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.analysis?.element_balance).toEqual({});
  });

  it("空 drawn_cards 时 first card 字段降级为空字符串", () => {
    const out = mergeApiReading({
      api: {},
      draw: makeDraw({ drawn_cards: [] }),
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.card_id).toBe("");
    expect(out.image).toBe("");
    expect(out.orientation).toBe("upright");
  });
});
