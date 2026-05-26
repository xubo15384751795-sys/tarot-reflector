/**
 * 牌阵元数据访问的小封装：UI 不直接 import JSON。
 */

import spreadsData from "@/data/tarot_rules/spreads.json";
import type { SpreadDefinition, SpreadId } from "@/lib/schema";

export type SpreadMeta = {
  spread_id: string;
  name_zh: string;
  description_zh: string;
  card_count: number;
  difficulty: string;
};

export const ALL_SPREADS: SpreadMeta[] = spreadsData.spreads.map((s) => ({
  spread_id: s.id,
  name_zh: s.name_zh,
  description_zh: s.description_zh,
  card_count: s.card_count,
  difficulty: s.difficulty,
}));

export function getSpreadDef(id: SpreadId | string): SpreadDefinition | undefined {
  return spreadsData.spreads.find((s) => s.id === id) as
    | SpreadDefinition
    | undefined;
}

export function getSpreadMeta(id: SpreadId | string): SpreadMeta | undefined {
  return ALL_SPREADS.find((s) => s.spread_id === id);
}
