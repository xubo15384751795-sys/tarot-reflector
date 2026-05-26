/**
 * 解读引擎扩展接口 v2 — 支持 78 张牌 + 多牌阵
 */

import type { CardDrawResult, DrawnCard, SpreadDefinition, TarotReading, UserInput } from "../schema";

/** 一次解读所需的完整上下文（单牌兼容 + 多牌阵） */
export type ReadingContext = {
  input: UserInput;
  /** Legacy single-card field (backward compat) */
  card?: CardDrawResult;
  /** New multi-card fields */
  drawn_cards?: DrawnCard[];
  spread?: SpreadDefinition;
};

/**
 * 解读生成器接口
 */
export interface ReadingGenerator {
  readonly id: string;
  readonly label: string;
  generate(ctx: ReadingContext): Promise<TarotReading>;
}

/**
 * 抽牌策略接口
 */
export interface CardDrawer {
  draw(domain: UserInput["domain"]): CardDrawResult;
}

/**
 * LLM 可能只返回文案字段；牌面元数据由 mergeReadingFromLLM 补全。
 */
export type LLMReadingPayload = Pick<
  TarotReading,
  "title" | "thesis" | "scenes" | "closing_line" | "disclaimer"
>;
