/**
 * 抽牌逻辑 v2 — 支持 78 张完整牌组 + 多牌阵
 *
 * 从完整 78 张牌中按牌阵要求抽取指定数量的牌，
 * 每张牌随机决定正位/逆位，并绑定到牌阵位置。
 */

import majorArcana from "@/data/cards/major_arcana.json";
import minorWands from "@/data/cards/minor_wands.json";
import minorCups from "@/data/cards/minor_cups.json";
import minorSwords from "@/data/cards/minor_swords.json";
import minorPentacles from "@/data/cards/minor_pentacles.json";
import spreadsData from "@/data/tarot_rules/spreads.json";
import type {
  CardData,
  DrawnCard,
  Orientation,
  SpreadDefinition,
  SpreadId,
  UserInput,
} from "./schema";

// 完整 78 张牌
const ALL_CARDS: CardData[] = [
  ...(majorArcana as unknown as CardData[]),
  ...(minorWands as unknown as CardData[]),
  ...(minorCups as unknown as CardData[]),
  ...(minorSwords as unknown as CardData[]),
  ...(minorPentacles as unknown as CardData[]),
];

// 牌阵定义索引
const SPREAD_MAP = new Map<string, SpreadDefinition>(
  spreadsData.spreads.map((s) => [s.id, s as SpreadDefinition])
);

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomOrientation(): Orientation {
  return randomPick(["upright", "reversed"]);
}

/**
 * 从完整牌组中随机抽取 N 张不重复的牌
 */
function drawRandomCards(count: number): CardData[] {
  const deck = [...ALL_CARDS];
  const drawn: CardData[] = [];
  for (let i = 0; i < count && deck.length > 0; i++) {
    const idx = Math.floor(Math.random() * deck.length);
    drawn.push(deck[idx]);
    deck.splice(idx, 1);
  }
  return drawn;
}

/**
 * 获取牌阵定义
 */
export function getSpread(spreadId: SpreadId): SpreadDefinition {
  const spread = SPREAD_MAP.get(spreadId);
  if (!spread) {
    throw new Error(`Unknown spread: ${spreadId}`);
  }
  return spread;
}

/**
 * 按牌阵抽牌：抽取指定数量的牌，绑定到牌阵位置
 */
export function drawForSpread(spreadId: SpreadId): DrawnCard[] {
  const spread = getSpread(spreadId);
  const cards = drawRandomCards(spread.card_count);

  return cards.map((card, i) => ({
    card,
    orientation: randomOrientation(),
    position: spread.positions[i],
    position_index: i,
  }));
}

/**
 * 获取完整牌组（用于调试或展示）
 */
export function getAllCards(): CardData[] {
  return ALL_CARDS;
}

/**
 * 按 ID 查找单张牌
 */
export function findCard(cardId: string): CardData | undefined {
  return ALL_CARDS.find((c) => c.id === cardId);
}

/**
 * 获取牌组统计信息
 */
export function getDeckStats(): {
  total: number;
  major: number;
  minor: number;
  by_suit: Record<string, number>;
} {
  const bySuit: Record<string, number> = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  let major = 0;
  for (const card of ALL_CARDS) {
    if (card.arcana === "major") {
      major++;
    } else if (card.suit) {
      bySuit[card.suit] = (bySuit[card.suit] || 0) + 1;
    }
  }
  return {
    total: ALL_CARDS.length,
    major,
    minor: ALL_CARDS.length - major,
    by_suit: bySuit,
  };
}
