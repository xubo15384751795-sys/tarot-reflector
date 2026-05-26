/**
 * 将 LLM 返回的文案与抽牌元数据合并为前端所需的 TarotReading。
 */

import { APP_DISCLAIMER } from "../constants";
import type { TarotReading } from "../schema";
import type { LLMReadingPayload, ReadingContext } from "./types";

export function mergeReadingFromLLM(
  ctx: ReadingContext,
  payload: LLMReadingPayload
): TarotReading {
  const { input } = ctx;
  const card = ctx.card!;
  const orientationLabel = card.orientation === "upright" ? "正位" : "逆位";

  return {
    title: payload.title ?? `${card.zh_name} · ${orientationLabel}`,
    thesis: payload.thesis,
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    cards: [
      {
        card_id: card.id,
        card_name: card.card_name,
        zh_name: card.zh_name,
        orientation: card.orientation,
        image: card.image,
        position_name: "核心象征",
        position_index: 0,
        motifs: card.motifs,
      },
    ],
    card_id: card.id,
    card_name: card.card_name,
    zh_name: card.zh_name,
    orientation: card.orientation,
    domain: input.domain,
    motifs: card.motifs,
    image: card.image,
    scenes: payload.scenes,
    closing_line: payload.closing_line ?? payload.thesis,
    disclaimer: payload.disclaimer ?? APP_DISCLAIMER,
  };
}
