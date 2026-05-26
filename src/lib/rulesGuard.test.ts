/**
 * rulesGuard 单元测试。
 *
 * 这是核心安全组件 —— 所有解读在交付前都过这一层。
 * 测试覆盖 §5.1 / §5.2 / §5.4 / §6 / §7 等规则项。
 */

import { describe, expect, it } from "vitest";
import {
  ReadingRulesViolationError,
  generateWithRulesRetry,
  validateAgainstRules,
} from "./rulesGuard";
import type { TarotReading, TarotScene } from "./schema";

// ─── 构造工具 ────────────────────────────────────────

function makeScene(overrides: Partial<TarotScene> = {}): TarotScene {
  return {
    scene_id: 1,
    type: "opening",
    step_label: "整体",
    headline: "新的开始",
    body: "这是一段足够长的中文 body 内容，用来描述当前牌面给出的整体气质与气息。它需要多于八个汉字。",
    visual_direction: "",
    duration: 6,
    ...overrides,
  };
}

function makeValidReading(overrides: Partial<TarotReading> = {}): TarotReading {
  // 单牌结构：7 幕，对应 STEP_LABELS 顺序
  const scenes: TarotScene[] = [
    makeScene({ scene_id: 1, type: "opening", step_label: "整体" }),
    makeScene({
      scene_id: 2,
      type: "card_analysis",
      step_label: "元素一",
      headline: "权杖",
      body: "权杖象征火元素的行动力与生命力，提醒此刻可以更主动地踏出一步。",
      focus_motif: "m1",
    }),
    makeScene({
      scene_id: 3,
      type: "card_analysis",
      step_label: "元素二",
      headline: "嫩芽",
      body: "嫩芽与新枝代表事情正在悄悄成型，给它一点耐心而不是马上要结果。",
      focus_motif: "m2",
    }),
    makeScene({
      scene_id: 4,
      type: "card_analysis",
      step_label: "元素三",
      headline: "云中之手",
      body: "云中伸出的手是外部的契机，意味着可以接住正在送到面前的机会。",
      focus_motif: "m1",
    }),
    makeScene({
      scene_id: 5,
      type: "card_analysis",
      step_label: "元素四",
      headline: "远方山影",
      body: "远方的山影是尚未展开的可能性，让自己保留一段未被规划的空白。",
      focus_motif: "m2",
    }),
    makeScene({
      scene_id: 6,
      type: "spread_synthesis",
      step_label: "综合",
      headline: "综合",
      body: "把上面四个角度合起来读：现在的关键不在结果，而在让自己开始一件小事。",
    }),
    makeScene({
      scene_id: 7,
      type: "closing",
      step_label: "建议",
      headline: "建议",
      body: "试着写下你今天可以开始做的一件小事，留出 15 分钟把它推进一步。",
    }),
  ];

  return {
    title: "新的开始",
    thesis: "这是一段足够长的中文开场陈述，用来给整张牌定下基调。",
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    cards: [
      {
        card_id: "the_fool",
        card_name: "The Fool",
        zh_name: "愚者",
        orientation: "upright",
        image: "/cards/major/the_fool.jpg",
        position_name: "整体",
        position_index: 0,
        motifs: [
          { id: "m1", label: "白玫瑰", meaning: "纯粹意图", bbox: { x: 0.2, y: 0.4, w: 0.1, h: 0.1 } },
          { id: "m2", label: "嫩芽", meaning: "新的开始", bbox: { x: 0.5, y: 0.5, w: 0.1, h: 0.1 } },
        ],
      },
    ],
    card_id: "the_fool",
    card_name: "The Fool",
    zh_name: "愚者",
    orientation: "upright",
    domain: "self",
    motifs: [
      { id: "m1", label: "白玫瑰", meaning: "纯粹意图", bbox: { x: 0.2, y: 0.4, w: 0.1, h: 0.1 } },
      { id: "m2", label: "嫩芽", meaning: "新的开始", bbox: { x: 0.5, y: 0.5, w: 0.1, h: 0.1 } },
    ],
    image: "/cards/major/the_fool.jpg",
    scenes,
    closing_line: "档案翻到这里。",
    disclaimer: "这不是命运预测，而是一种象征性反思。",
    ...overrides,
  };
}

// ─── 测试 ────────────────────────────────────────────

describe("validateAgainstRules", () => {
  describe("happy path", () => {
    it("有效解读返回 ok=true 且无 error", () => {
      const report = validateAgainstRules(makeValidReading());
      expect(report.ok).toBe(true);
      expect(report.errors).toEqual([]);
    });
  });

  describe("card scope", () => {
    it("未知 card_id 触发 card.unknown_id error", () => {
      const report = validateAgainstRules(
        makeValidReading({ card_id: "not_a_real_card" }),
      );
      expect(report.ok).toBe(false);
      expect(report.errors.some((v) => v.code === "card.unknown_id")).toBe(true);
    });

    it("78 张牌组内的 minor arcana id 通过", () => {
      const report = validateAgainstRules(
        makeValidReading({ card_id: "wands_ace" }),
      );
      expect(report.errors.filter((v) => v.code === "card.unknown_id")).toEqual([]);
    });
  });

  describe("orientation", () => {
    it("非法 orientation 触发 error", () => {
      const report = validateAgainstRules(
        // @ts-expect-error: 故意传非法值测试 guard
        makeValidReading({ orientation: "sideways" }),
      );
      expect(report.errors.some((v) => v.code === "card.orientation_invalid")).toBe(
        true,
      );
    });
  });

  describe("banned phrases", () => {
    it.each([
      "命中注定", // §5.2 命运
      "他一定爱你", // §5.2 感情承诺
      "横财", // §5.2 财富
      "灾难即将降临", // §5.2 恐吓
    ])("禁用词 %s 触发 phrase.banned error", (phrase) => {
      const reading = makeValidReading();
      reading.scenes[0].body = `这段话里包含了 ${phrase} 所以应该被拦下来。`;
      const report = validateAgainstRules(reading);
      expect(report.ok).toBe(false);
      expect(report.errors.some((v) => v.code === "phrase.banned")).toBe(true);
    });
  });

  describe("prediction patterns (§5.4)", () => {
    it.each(["你将会", "你一定会", "必将", "你注定"])(
      "断言式预测 %s 触发 phrase.prediction error",
      (phrase) => {
        const reading = makeValidReading();
        reading.scenes[6].body = `${phrase}得到答案，但这不一定准确。`;
        const report = validateAgainstRules(reading);
        expect(report.ok).toBe(false);
        expect(report.errors.some((v) => v.code === "phrase.prediction")).toBe(
          true,
        );
      },
    );
  });

  describe("motif binding", () => {
    it("card_analysis 缺少 focus_motif 触发 error", () => {
      const reading = makeValidReading();
      reading.scenes[1].focus_motif = null;
      const report = validateAgainstRules(reading);
      expect(report.errors.some((v) => v.code === "scene.motif_focus_missing")).toBe(
        true,
      );
    });

    it("focus_motif 不在 motifs[] 中触发 error", () => {
      const reading = makeValidReading();
      reading.scenes[1].focus_motif = "m_not_exist";
      const report = validateAgainstRules(reading);
      expect(report.errors.some((v) => v.code === "scene.motif_focus_unknown")).toBe(
        true,
      );
    });

    it("focus_motif 在多牌阵某张牌的 motifs[] 中应通过", () => {
      const reading = makeValidReading();
      // 把 m1 从顶层 motifs 移除，但保留在 cards[0].motifs 中
      reading.motifs = [];
      const report = validateAgainstRules(reading);
      // m1 还在 cards[0].motifs 里，所以 focus_motif 应当合法
      expect(report.errors.filter((v) => v.code === "scene.motif_focus_unknown")).toEqual(
        [],
      );
    });
  });

  describe("language (§5.1)", () => {
    it("CJK 占比过低的 body 触发 language.not_chinese", () => {
      const reading = makeValidReading();
      reading.scenes[1].body =
        "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
      const report = validateAgainstRules(reading);
      expect(report.errors.some((v) => v.code === "language.not_chinese")).toBe(true);
    });
  });

  describe("disclaimer (§7)", () => {
    it("缺少关键词触发 warning", () => {
      const reading = makeValidReading({ disclaimer: "请理性看待结果。" });
      const report = validateAgainstRules(reading);
      // warning 不影响 ok
      expect(report.ok).toBe(true);
      expect(
        report.violations.some((v) => v.code === "disclaimer.missing_keywords"),
      ).toBe(true);
    });

    it("包含「象征性反思」或「不是命运预测」之一不触发", () => {
      const reading = makeValidReading({
        disclaimer: "这只是一面镜子，是象征性反思。",
      });
      const report = validateAgainstRules(reading);
      expect(
        report.violations.some((v) => v.code === "disclaimer.missing_keywords"),
      ).toBe(false);
    });
  });

  describe("length (§6)", () => {
    it("超长 headline 触发 warning", () => {
      const reading = makeValidReading();
      reading.scenes[0].headline = "这一段标题非常非常非常非常非常长完全超过限制";
      const report = validateAgainstRules(reading);
      expect(report.violations.some((v) => v.code === "length.headline")).toBe(true);
      // warning 不影响 ok
      expect(report.ok).toBe(true);
    });
  });

  describe("actionable advice (§5.4 第 3 条)", () => {
    it("closing 缺少可执行动作触发 warning", () => {
      const reading = makeValidReading();
      reading.scenes[6].body = "这只是一段没有可执行动词的总结性陈述罢了。";
      const report = validateAgainstRules(reading);
      expect(report.violations.some((v) => v.code === "advice.not_actionable")).toBe(
        true,
      );
    });

    it("包含动词「写下」时通过", () => {
      const reading = makeValidReading();
      reading.scenes[6].body = "写下当前最让你停顿的一件小事。";
      const report = validateAgainstRules(reading);
      expect(report.violations.some((v) => v.code === "advice.not_actionable")).toBe(
        false,
      );
    });
  });
});

describe("generateWithRulesRetry", () => {
  it("首次合规直接返回", async () => {
    let attempts = 0;
    const out = await generateWithRulesRetry(async () => {
      attempts++;
      return makeValidReading();
    });
    expect(out.attempts).toBe(1);
    expect(attempts).toBe(1);
    expect(out.finalReport.ok).toBe(true);
  });

  it("首次违规、第二次合规：会重试", async () => {
    let attempt = 0;
    const out = await generateWithRulesRetry(
      async () => {
        attempt++;
        if (attempt === 1) {
          const bad = makeValidReading();
          bad.scenes[0].body = "里面有 必将 这种禁用词。";
          return bad;
        }
        return makeValidReading();
      },
      {
        onRetry: async () => makeValidReading(),
        maxAttempts: 3,
      },
    );
    expect(out.attempts).toBe(2);
    expect(out.finalReport.ok).toBe(true);
  });

  it("连续违规抛 ReadingRulesViolationError", async () => {
    const bad = () => {
      const r = makeValidReading();
      r.scenes[0].body = "包含 命中注定 这个禁用词。";
      return r;
    };
    await expect(
      generateWithRulesRetry(async () => bad(), {
        onRetry: async () => bad(),
        maxAttempts: 2,
      }),
    ).rejects.toBeInstanceOf(ReadingRulesViolationError);
  });
});
