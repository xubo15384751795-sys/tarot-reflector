import { describe, expect, it } from "vitest";
import { normalizeReading } from "./normalizeReading";
import type {
  ApiReadingResponse,
  LocalCardMeaning,
  SpreadSnapshot,
} from "../types/reading";

const DRAW: SpreadSnapshot = {
  reading_id: "r_1",
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
};

const MEANINGS: LocalCardMeaning[] = [
  {
    card_id: "the_fool",
    name_zh: "愚者",
    orientation: "upright",
    keywords: ["新的开始"],
    meaning: "愚者代表新的开始。",
  },
];

const API: ApiReadingResponse = {
  title_zh: "来自 API 的标题",
  opening_zh: "来自 API 的开场。",
  position_readings: [
    {
      position_index: 0,
      position_name_zh: "整体",
      headline_zh: "API headline",
      body_zh: "API body",
    },
  ],
};

describe("normalizeReading", () => {
  it("api 非 null 时走 mergeApiReading", () => {
    const out = normalizeReading({
      api: API,
      draw: DRAW,
      meanings: MEANINGS,
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.title).toBe("来自 API 的标题");
    expect(out.thesis).toBe("来自 API 的开场。");
  });

  it("api 为 null 时走 buildLocalFallbackReading", () => {
    const out = normalizeReading({
      api: null,
      draw: DRAW,
      meanings: MEANINGS,
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.title).toContain("愚者");
    expect(out.thesis).toBe("愚者代表新的开始。");
  });

  it("spreadNameOverride 覆盖 spread_name_zh", () => {
    const out = normalizeReading({
      api: API,
      draw: DRAW,
      meanings: MEANINGS,
      spreadId: "single_card",
      domain: "self",
      spreadNameOverride: "今日一牌",
    });
    expect(out.spread_name_zh).toBe("今日一牌");
  });

  it("无 override 时保持 draw.spread_name_zh", () => {
    const out = normalizeReading({
      api: null,
      draw: DRAW,
      meanings: MEANINGS,
      spreadId: "single_card",
      domain: "self",
    });
    expect(out.spread_name_zh).toBe("单牌解读");
  });
});
