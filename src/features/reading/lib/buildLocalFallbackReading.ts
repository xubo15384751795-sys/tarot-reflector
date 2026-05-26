/**
 * 本地兜底解读：API 没返回时，用 drawSnapshot + 传统牌义拼出最小可用的解读。
 * 与 mergeApiReading 并列：前者"拿到了"，后者"没拿到"。
 */

import type { Orientation, SpreadId } from "@/lib/schema";
import type {
  DrawnCardSnapshot,
  LocalCardMeaning,
  LocalFallbackReading,
  SpreadSnapshot,
} from "../types/reading";

export type BuildLocalFallbackInput = {
  draw: SpreadSnapshot;
  meanings: LocalCardMeaning[];
  spreadId: SpreadId;
  domain: string;
};

export function buildLocalFallbackReading(
  input: BuildLocalFallbackInput,
): LocalFallbackReading {
  const { draw, meanings, spreadId, domain } = input;
  const drawnCards: DrawnCardSnapshot[] = draw.drawn_cards;
  const firstCard = drawnCards[0];
  const firstMeaning = meanings[0];

  const scenes: LocalFallbackReading["scenes"] = drawnCards.map((d, i) => ({
    scene_id: i + 1,
    type: i === 0 ? "opening" : "card_analysis",
    step_label: d.position_name_zh ?? `位置${i + 1}`,
    headline: `${d.card_name_zh} · ${d.orientation_zh}`,
    body: meanings[i]?.meaning ?? "",
    visual_direction: "",
    duration: 6,
  }));

  return {
    title: firstMeaning
      ? `${firstMeaning.name_zh} · ${firstCard?.orientation_zh ?? ""}`
      : "解读",
    thesis: firstMeaning?.meaning ?? "",
    spread_id: spreadId,
    spread_name_zh: draw.spread_name_zh ?? "解读",
    cards: drawnCards.map((d) => ({
      card_id: d.card_id,
      card_name: d.card_name_en,
      zh_name: d.card_name_zh,
      orientation: d.orientation,
      image: d.image,
      position_name: d.position_name_zh,
      position_index: d.position_index,
      motifs: [],
    })),
    card_id: firstCard?.card_id ?? "",
    card_name: firstCard?.card_name_en ?? "",
    zh_name: firstCard?.card_name_zh ?? "",
    orientation: (firstCard?.orientation ?? "upright") as Orientation,
    domain,
    motifs: [],
    image: firstCard?.image ?? "",
    scenes,
    closing_line: firstMeaning?.meaning ?? "",
    disclaimer: "这不是命运预测，而是一种象征性反思。",
  };
}
