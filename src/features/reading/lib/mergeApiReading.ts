/**
 * 把 /api/reading/generate 返回的 "AI 形状" 与 draw snapshot 合并成 ReadingScript。
 *
 * 输入输出都是显式类型，禁止 any。
 */

import type { Orientation, SpreadId, TarotReading } from "@/lib/schema";
import type {
  ApiReadingResponse,
  ReadingScript,
  SpreadSnapshot,
} from "../types/reading";

export type MergeApiReadingInput = {
  api: ApiReadingResponse;
  draw: SpreadSnapshot;
  spreadId: SpreadId;
  domain: string;
};

export function mergeApiReading(input: MergeApiReadingInput): ReadingScript {
  const { api, draw, spreadId, domain } = input;
  const drawnCards = draw.drawn_cards;
  const first = drawnCards[0];

  const cards: TarotReading["cards"] = drawnCards.map((dc, i) => ({
    card_id: dc.card_id,
    card_name: dc.card_name_en,
    zh_name: dc.card_name_zh,
    orientation: dc.orientation,
    image: dc.image,
    position_name: dc.position_name_zh,
    position_index: dc.position_index,
    motifs: api.cards?.[i]?.motifs ?? [],
  }));

  const positionReadings = api.position_readings ?? [];

  const scenes: TarotReading["scenes"] = positionReadings.flatMap<
    TarotReading["scenes"][number]
  >((pr) => {
    const sceneList = pr.scenes ?? [];

    if (sceneList.length === 0) {
      return [
        {
          scene_id: 1,
          type: "opening",
          step_label: pr.position_name_zh ?? "解读",
          headline: pr.headline_zh ?? "",
          body: pr.body_zh ?? "",
          visual_direction: "",
          duration: 6,
        },
      ];
    }

    return sceneList.map((s, si) => ({
      scene_id: si + 1,
      type: s.type ?? "card_analysis",
      step_label: pr.position_name_zh ?? `位置${pr.position_index}`,
      headline: s.headline_zh ?? pr.headline_zh ?? "",
      body: s.body_zh ?? pr.body_zh ?? "",
      insight: s.annotation_label_zh ?? undefined,
      connection: undefined,
      visual_direction: "",
      duration: s.duration ?? 6,
      focus_motif: s.focus_motif ?? null,
      annotation_label: s.annotation_label_zh ?? null,
    }));
  });

  return {
    title: api.title_zh ?? "",
    thesis: api.opening_zh ?? "",
    spread_id: spreadId,
    spread_name_zh: draw.spread_name_zh,
    cards,
    card_id: first?.card_id ?? "",
    card_name: first?.card_name_en ?? "",
    zh_name: first?.card_name_zh ?? "",
    orientation: (first?.orientation ?? "upright") as Orientation,
    domain,
    motifs: api.cards?.[0]?.motifs ?? [],
    image: first?.image ?? "",
    scenes,
    closing_line: api.closing_line_zh ?? "",
    disclaimer: api.disclaimer_zh ?? "这不是命运预测，而是一种象征性反思。",
    analysis: api.spread_analysis
      ? {
          ...api.spread_analysis,
          element_balance: api.spread_analysis.element_balance ?? {},
        }
      : undefined,
  };
}
