/**
 * 在本地 78 张牌数据中查传统牌义（用于卡牌翻开后的即时显示与本地兜底）。
 */

import type { CardData, Orientation } from "@/lib/schema";
import majorArcana from "@/data/cards/major_arcana.json";
import minorWands from "@/data/cards/minor_wands.json";
import minorCups from "@/data/cards/minor_cups.json";
import minorSwords from "@/data/cards/minor_swords.json";
import minorPentacles from "@/data/cards/minor_pentacles.json";
import type { LocalCardMeaning } from "../types/reading";

// 牌库数据是 readonly 的；这里强制断言为 CardData 数组以便消费。
const ALL_CARDS: CardData[] = [
  ...(majorArcana as unknown as CardData[]),
  ...(minorWands as unknown as CardData[]),
  ...(minorCups as unknown as CardData[]),
  ...(minorSwords as unknown as CardData[]),
  ...(minorPentacles as unknown as CardData[]),
];

export function lookupLocalMeaning(
  cardId: string,
  orientation: Orientation,
): LocalCardMeaning | null {
  const card = ALL_CARDS.find((c) => c.id === cardId);
  if (!card) return null;
  const trad =
    orientation === "upright" ? card.traditional.upright : card.traditional.reversed;
  return {
    card_id: cardId,
    name_zh: card.name_zh,
    orientation,
    keywords: trad.keywords_zh ?? [],
    meaning: trad.meaning_zh ?? "",
  };
}
