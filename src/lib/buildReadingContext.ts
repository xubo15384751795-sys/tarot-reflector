/**
 * 构建解读上下文 — 加载规则层 + 抽牌结果，组装完整的解读上下文
 *
 * 这是解读引擎的核心组装模块，将：
 * - 用户输入
 * - 牌阵定义
 * - 抽牌结果
 * - 规则层（花色、数字、宫廷牌、正逆位、关系规则）
 * 统一打包成 ReadingContext，供 buildPrompt 和 generators 使用。
 */

import suitsData from "@/data/tarot_rules/suits.json";
import numbersData from "@/data/tarot_rules/numbers.json";
import courtCardsData from "@/data/tarot_rules/court_cards.json";
import orientationsData from "@/data/tarot_rules/orientations.json";
import relationshipRulesData from "@/data/tarot_rules/relationship_rules.json";
import type {
  DrawnCard,
  ReadingContext,
  UserInput,
} from "./schema";
import { drawForSpread, getSpread } from "./drawCards";

/**
 * 构建完整的解读上下文
 */
export function buildReadingContext(
  input: UserInput,
  drawnCards?: DrawnCard[]
): ReadingContext {
  const spreadId = input.spread_id ?? "single_card";
  const spread = getSpread(spreadId);
  const cards = drawnCards ?? drawForSpread(spreadId);

  return {
    input,
    spread,
    drawn_cards: cards,
    rules: {
      suits: suitsData as unknown as ReadingContext["rules"]["suits"],
      numbers: numbersData as unknown as ReadingContext["rules"]["numbers"],
      court_cards: courtCardsData as unknown as ReadingContext["rules"]["court_cards"],
      orientations: orientationsData as unknown as ReadingContext["rules"]["orientations"],
      relationship_rules: relationshipRulesData as unknown as ReadingContext["rules"]["relationship_rules"],
    },
  };
}

/**
 * 为单张牌获取牌义上下文（供 LLM 使用）
 */
export function getCardMeaningContext(ctx: ReadingContext, cardIndex: number): string {
  const dc = ctx.drawn_cards[cardIndex];
  if (!dc) return "";

  const { card, orientation, position } = dc;
  const oLabel = orientation === "upright" ? "正位" : "逆位";
  const oData =
    orientation === "upright"
      ? ctx.rules.orientations.upright
      : ctx.rules.orientations.reversed;

  const parts: string[] = [];

  // 位置信息
  parts.push(`【牌阵位置】${position.name_zh}（${position.meaning_zh}）`);

  // 牌面信息
  parts.push(`【牌面】${card.name_zh}（${card.name_en}）· ${oLabel}`);

  // 传统牌义
  const traditional =
    orientation === "upright"
      ? card.traditional.upright
      : card.traditional.reversed;
  parts.push(`【关键词】${traditional.keywords_zh.join("、")}`);
  parts.push(`【牌义】${traditional.meaning_zh}`);

  // 符号组合规则
  if (card.symbolic_components.suit_rule_zh) {
    parts.push(`【花色规则】${card.symbolic_components.suit_rule_zh}`);
  }
  if (card.symbolic_components.number_rule_zh) {
    parts.push(`【数字规则】${card.symbolic_components.number_rule_zh}`);
  }
  if (card.symbolic_components.court_rule_zh) {
    parts.push(`【宫廷规则】${card.symbolic_components.court_rule_zh}`);
  }
  parts.push(`【组合解读】${card.symbolic_components.combined_rule_zh}`);

  // 领域映射
  const domainKey =
    ctx.input.domain === "love"
      ? "感情"
      : ctx.input.domain === "career"
      ? "工作"
      : ctx.input.domain === "project"
      ? "项目"
      : ctx.input.domain === "study"
      ? "学习"
      : ctx.input.domain === "money"
      ? "财务"
      : "自我";
  const domainMeaning = card.domain_mapping[domainKey];
  if (domainMeaning) {
    parts.push(`【${domainKey}领域】${domainMeaning}`);
  }

  // 正逆位规则
  parts.push(`【正逆位规则】${oData.rule_zh}`);

  return parts.join("\n");
}

/**
 * 为整个牌阵生成完整的规则上下文（供 LLM 使用）
 */
export function buildFullRulesContext(ctx: ReadingContext): string {
  const parts: string[] = [];

  parts.push("=== 塔罗规则体系 ===");
  parts.push(`体系：Rider-Waite-Smith`);
  parts.push(`牌阵：${ctx.spread.name_zh}（${ctx.spread.card_count} 张牌）`);
  parts.push(`牌阵说明：${ctx.spread.description_zh}`);

  if (ctx.spread.protection_rules) {
    parts.push("\n【保护规则】");
    for (const rule of ctx.spread.protection_rules) {
      parts.push(`- ${rule}`);
    }
  }

  if (ctx.spread.relationship_rules) {
    parts.push("\n【牌间关系规则】");
    for (const rule of ctx.spread.relationship_rules) {
      parts.push(`- ${rule}`);
    }
  }

  parts.push("\n=== 各牌分析 ===");
  for (let i = 0; i < ctx.drawn_cards.length; i++) {
    parts.push(`\n--- 第 ${i + 1} 张牌 ---`);
    parts.push(getCardMeaningContext(ctx, i));
  }

  return parts.join("\n");
}
