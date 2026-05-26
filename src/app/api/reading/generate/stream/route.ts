/**
 * POST /api/reading/generate/stream — SSE 渐进式解读
 *
 * 与 /api/reading/generate 同 body 结构。返回 text/event-stream，
 * 按位置逐个推 `event: position` 帧，最后一个 `event: done` 收束。
 *
 * 设计动机：
 *   - 当用户接入 LLM 时，前端不必等 6000 tokens 全部生成完再渲染——
 *     第一张位置解读到达就能让用户开始读
 *   - 本地模板路径也走同一接口，每个 position 之间插 50ms 软延迟，
 *     给前端制造一个"逐张翻开"的节拍感（也方便联调）
 *
 * 帧格式（兼容 EventSource）：
 *   event: meta
 *   data: { title_zh, opening_zh, spread_name_zh, ... }
 *
 *   event: position
 *   data: { position_index, headline_zh, body_zh, scenes, ... }
 *
 *   event: done
 *   data: { closing_zh, disclaimer_zh, _source }
 *
 *   event: error
 *   data: { message }
 */

import { NextRequest } from "next/server";
import { drawForSpread, getSpread, findCard } from "@/lib/drawCards";
import { analyzeSpread } from "@/lib/spreadAnalyzer";
import { analyzeCardRelationships } from "@/lib/cardRelationshipAnalyzer";
import { multiCardReadingGenerator } from "@/lib/reading";
import type {
  DrawnCard,
  SpreadId,
  TarotReading,
  TarotScene,
  UserInput,
} from "@/lib/schema";

export const runtime = "nodejs"; // SSE 需要 Node runtime（不要 edge 的限制）

/** SSE event 帧拼字符串 */
function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** 把一次完整 reading 拆成 SSE 流：meta → 多个 position → done */
async function* streamReading(
  reading: TarotReading,
  drawnCards: DrawnCard[],
  perPositionDelayMs: number,
): AsyncGenerator<string> {
  // meta 帧（前端立刻拿到标题 + 开场 + 牌阵信息）
  yield sseFrame("meta", {
    title_zh: reading.title,
    opening_zh: reading.thesis,
    spread_id: reading.spread_id,
    spread_name_zh: reading.spread_name_zh,
    drawn_cards: drawnCards.map((dc) => ({
      position_index: dc.position_index,
      position_name_zh: dc.position.name_zh,
      card_id: dc.card.id,
      card_name_zh: dc.card.name_zh,
      orientation: dc.orientation,
      orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
      image: dc.card.image,
    })),
    cards: drawnCards.map((dc, i) => ({
      position_index: dc.position_index,
      card_id: dc.card.id,
      motifs: reading.cards?.[i]?.motifs ?? reading.motifs ?? [],
    })),
  });

  // 按位置分组 scene
  for (const dc of drawnCards) {
    const matched = reading.scenes.filter(
      (s) => s.step_label === dc.position.name_zh,
    );
    const sceneList: TarotScene[] =
      matched.length > 0
        ? matched
        : reading.scenes.filter(
            (s) => s.type !== "opening" && s.type !== "closing",
          );

    yield sseFrame("position", {
      position_index: dc.position_index,
      position_name_zh: dc.position.name_zh,
      card_id: dc.card.id,
      card_name_zh: dc.card.name_zh,
      orientation: dc.orientation,
      headline_zh: sceneList[0]?.headline ?? reading.thesis,
      body_zh: sceneList[0]?.body ?? "",
      scenes: sceneList.map((s) => ({
        type: s.type,
        headline_zh: s.headline,
        body_zh: s.body,
        connection_zh: s.connection,
        focus_motif: s.focus_motif,
        annotation_label_zh: s.annotation_label,
      })),
    });

    if (perPositionDelayMs > 0) {
      await new Promise((r) => setTimeout(r, perPositionDelayMs));
    }
  }

  // closing
  const closing = reading.scenes.find((s) => s.type === "closing");
  yield sseFrame("done", {
    closing_zh: closing?.body ?? reading.closing_line ?? "",
    disclaimer_zh: reading.disclaimer,
    _source: "local_template",
  });
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const body = (await request.json()) as {
    reading_id?: string;
    user?: { question_original: string; domain?: string };
    spread?: { id: string };
    drawn_cards?: Array<{
      position_index: number;
      card_id: string;
      orientation: string;
    }>;
  };

  if (!body.user?.question_original) {
    return new Response(
      sseFrame("error", { message: "请提供用户问题。" }),
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      },
    );
  }

  const spreadId = (body.spread?.id ?? "single_card") as SpreadId;
  const spread = getSpread(spreadId);

  let drawnCards: DrawnCard[];
  if (body.drawn_cards && body.drawn_cards.length > 0) {
    drawnCards = body.drawn_cards.map((dc, i) => {
      const card = findCard(dc.card_id);
      if (!card) throw new Error(`Unknown card: ${dc.card_id}`);
      return {
        card,
        orientation: dc.orientation as "upright" | "reversed",
        position: spread.positions[i] ?? {
          index: i,
          name_zh: `位置${i + 1}`,
          name_en: `Position ${i + 1}`,
          meaning_zh: "",
        },
        position_index: dc.position_index,
      };
    });
  } else {
    drawnCards = drawForSpread(spreadId);
  }

  const userInput: UserInput = {
    question: body.user.question_original,
    domain: (body.user.domain ?? "self") as UserInput["domain"],
    spread_id: spreadId,
  };

  // 触发本地模板生成；analyzeSpread/analyzeCardRelationships 暂时 fire-and-forget
  // 以保留与非流式版本一致的副作用（埋点 / 日志）
  void analyzeSpread(drawnCards);
  void analyzeCardRelationships(drawnCards, spread);

  // 本地模板：~5ms 完成。生成完整 reading 后按位置拆 SSE
  const reading = await multiCardReadingGenerator.generate({
    input: userInput,
    drawn_cards: drawnCards,
    spread,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 模板路径用 80ms 节拍模拟"渐进出 scene"，给前端动画呼吸感
        for await (const frame of streamReading(reading, drawnCards, 80)) {
          controller.enqueue(encoder.encode(frame));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            sseFrame("error", {
              message: err instanceof Error ? err.message : "解读流中断",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // 让 nginx 也别 buffer
    },
  });
}
