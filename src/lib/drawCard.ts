/**
 * 抽牌逻辑
 *
 * 从 22 张大阿卡纳中随机选一张，并随机决定正位 / 逆位。
 * 牌面图片路径来自 tarot_cards.json 的 image 字段（需先运行 cards:wire）。
 */

import tarotCards from "@/data/tarot_cards.json";
import type { CardDrawResult, Motif } from "./schema";
import type { CardDrawer } from "./reading/types";

const MAJOR_ARCANA = tarotCards.filter((c) => c.arcana === "major");

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function drawCard(): CardDrawResult {
  const card = randomPick(MAJOR_ARCANA);
  const orientation = randomPick(["upright", "reversed"] as const);

  const image = (card as { image?: string }).image;
  if (!image) {
    // Fail loud — the project requires real card art, no fallbacks.
    throw new Error(
      `Card "${card.id}" has no \`image\` field. Run scripts/wire_card_images.py.`
    );
  }

  return {
    id: card.id,
    card_name: card.name,
    zh_name: card.zh_name,
    orientation,
    core_symbols: card.core_symbols,
    upright_meaning: card.upright.meaning,
    reversed_meaning: card.reversed.meaning,
    domain_meaning: "",
    risk: card.risk,
    advice: card.advice,
    visual_motifs: card.visual_motifs,
    motifs: (card.motifs ?? []) as Motif[],
    image,
  };
}

export function drawCardWithDomain(domain: string): CardDrawResult {
  const result = drawCard();
  const card = MAJOR_ARCANA.find((c) => c.id === result.id)!;
  result.domain_meaning =
    card.domains[domain as keyof typeof card.domains] ?? "";
  return result;
}

/** 默认 CardDrawer 实现，与 defaultCardDrawer 行为一致 */
export const defaultDrawCard: CardDrawer = {
  draw(domain) {
    return drawCardWithDomain(domain);
  },
};
