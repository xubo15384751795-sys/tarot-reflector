/**
 * 解读引擎注册表与统一入口
 *
 * 流程：drawer.draw() → generator.generate(ctx) → validateReading()（结构性）→
 *      validateAgainstRules()（tarot_rules.md 规则守卫）→ 返回。
 *
 * generateReading() 是对外主函数；API 路由应调用此模块。
 */

import { READING_PROVIDER_ENV, type ReadingProvider } from "../constants";
import { drawCardWithDomain } from "../drawCard";
import { drawForSpread, getSpread } from "../drawCards";
import {
  ReadingRulesViolationError,
  validateAgainstRules,
  type GuardReport,
} from "../rulesGuard";
import { DISCLAIMER_KEYWORDS } from "../rulesGuard.shared";
import type { TarotReading, UserInput } from "../schema";
import { aiReadingGenerator } from "./aiGenerator.stub";
import { multiCardReadingGenerator } from "./multiCardGenerator";
import { templateReadingGenerator } from "./templateGenerator";
import type { CardDrawer, ReadingContext, ReadingGenerator } from "./types";
import { validateReading } from "./validateReading";

const GENERATORS: Record<ReadingProvider, ReadingGenerator> = {
  template: templateReadingGenerator,
  ai: aiReadingGenerator,
};

/** 默认抽牌实现；可替换为自定义 CardDrawer */
export const defaultCardDrawer: CardDrawer = {
  draw(domain) {
    return drawCardWithDomain(domain);
  },
};

export function getReadingProvider(): ReadingProvider {
  const raw = process.env[READING_PROVIDER_ENV]?.trim().toLowerCase();
  if (raw === "ai") return "ai";
  return "template";
}

export function getReadingGenerator(
  provider: ReadingProvider = getReadingProvider()
): ReadingGenerator {
  return GENERATORS[provider] ?? templateReadingGenerator;
}

/** 列出已注册的解读引擎（供 GET /api/reading 文档用） */
export function listReadingGenerators(): Array<{
  id: string;
  label: string;
  active: boolean;
}> {
  const active = getReadingProvider();
  return Object.values(GENERATORS).map((g) => ({
    id: g.id,
    label: g.label,
    active: g.id === active,
  }));
}

export type GenerateReadingOptions = {
  /** 自定义抽牌策略，默认 randomPick */
  cardDrawer?: CardDrawer;
  /** 强制指定解读引擎，默认读环境变量 */
  provider?: ReadingProvider;
  /** 是否校验返回结构（结构性 validate + 规则守卫），默认 true */
  validate?: boolean;
};

/**
 * 兜底：disclaimer 若不含关键语义，补齐为默认文案。
 * tarot_rules.md §7 允许这一处自动修复（仅 disclaimer 一个字段）。
 */
function patchDisclaimer(reading: TarotReading): TarotReading {
  const d = reading.disclaimer ?? "";
  const ok = DISCLAIMER_KEYWORDS.some((k) => d.includes(k));
  if (ok) return reading;
  return { ...reading, disclaimer: "象征性反思，不是命运预测。" };
}

/**
 * 生成一次完整解读（抽牌 + 文案 + 规则守卫）
 *
 * 自动路由：如果 input.spread_id 是多牌阵，走 multiCardGenerator；
 *           否则走原有单牌流程。
 *
 * @param input - 用户问题、领域、可选 context
 * @param options - 可注入 cardDrawer / provider，便于测试或 A/B
 *
 * 抛错：
 *   - ReadingValidationError：结构字段缺失（来自 validateReading）
 *   - ReadingRulesViolationError：违反 tarot_rules.md 规则（来自规则守卫）
 */
export async function generateReading(
  input: UserInput,
  options: GenerateReadingOptions = {}
): Promise<TarotReading> {
  const spreadId = input.spread_id;

  // Multi-card route
  if (spreadId && spreadId !== "single_card") {
    return generateMultiCardReading(input, options);
  }

  // Single-card route (backward compatible)
  const drawer = options.cardDrawer ?? defaultCardDrawer;
  const generator = getReadingGenerator(options.provider);

  const ctx: ReadingContext = {
    input,
    card: drawer.draw(input.domain),
  };

  const raw = await generator.generate(ctx);
  const reading = patchDisclaimer(raw);

  if (options.validate === false) {
    return reading;
  }

  // 1) 结构性校验（字段是否存在）
  validateReading(reading);

  // 2) 规则守卫（tarot_rules.md）
  const report: GuardReport = validateAgainstRules(reading);
  if (!report.ok) {
    const warnings = report.violations.filter((v) => v.severity === "warning");
    if (warnings.length) {
      console.warn(
        `[reading] rulesGuard warnings (${generator.id}):`,
        warnings.map((w) => `${w.code}@${w.field ?? "-"}: ${w.detail}`).join("; ")
      );
    }
    throw new ReadingRulesViolationError(
      `解读违反 tarot_rules.md：${report.errors.map((e) => e.code).join(", ")}`,
      report.violations
    );
  }

  return reading;
}

/**
 * 多牌阵解读入口 — 专门为多牌阵设计
 *
 * 使用 multiCardGenerator 生成模板解读，
 * 支持完整的多牌阵验证流程。
 */
export async function generateMultiCardReading(
  input: UserInput,
  options: GenerateReadingOptions = {}
): Promise<TarotReading> {
  const spreadId = input.spread_id ?? "situation_obstacle_advice";
  const spread = getSpread(spreadId);
  const drawnCards = drawForSpread(spreadId);

  const ctx: ReadingContext = {
    input,
    drawn_cards: drawnCards,
    spread,
  };

  const raw = await multiCardReadingGenerator.generate(ctx);
  const reading = patchDisclaimer(raw);

  if (options.validate === false) {
    return reading;
  }

  validateReading(reading);

  const report: GuardReport = validateAgainstRules(reading);
  if (!report.ok) {
    const warnings = report.violations.filter((v) => v.severity === "warning");
    if (warnings.length) {
      console.warn(
        `[reading] rulesGuard warnings (multi_card_template):`,
        warnings.map((w) => `${w.code}@${w.field ?? "-"}: ${w.detail}`).join("; ")
      );
    }
    throw new ReadingRulesViolationError(
      `解读违反 tarot_rules.md：${report.errors.map((e) => e.code).join(", ")}`,
      report.violations
    );
  }

  return reading;
}

export type {
  ReadingContext,
  ReadingGenerator,
  CardDrawer,
  LLMReadingPayload,
} from "./types";
export { buildDynamicReadingPrompt } from "./buildPrompt";
export { mergeReadingFromLLM } from "./mergeReading";
export { multiCardReadingGenerator } from "./multiCardGenerator";
export { recommendSpread } from "./recommendSpread";
export { reframeQuestion } from "./reframeQuestion";
export { validateReading, ReadingValidationError } from "./validateReading";
export {
  validateAgainstRules,
  ReadingRulesViolationError,
  generateWithRulesRetry,
} from "../rulesGuard";
