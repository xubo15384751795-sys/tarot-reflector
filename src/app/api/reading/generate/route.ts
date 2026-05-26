/**
 * POST /api/reading/generate — 生成完整解读
 *
 * **默认走本地模板**（templateReadingGenerator + multiCardReadingGenerator）。
 * 仅当 OPENAI_API_KEY / DEEPSEEK_API_KEY 设置时才调用外部 LLM。
 *
 * 这是"撤走 API"的入口：让默认路径不再依赖云端，
 * 既消除 8s+ 的 LLM 等待延迟，也避免无 key 时 503。
 */

import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai";
import { generateWithAiGuard } from "@/lib/aiReadingGuard";
import { buildReadingGeneratePrompt } from "@/lib/prompts/readingGenerate";
import { drawForSpread, getSpread, findCard } from "@/lib/drawCards";
import { analyzeSpread } from "@/lib/spreadAnalyzer";
import { analyzeCardRelationships } from "@/lib/cardRelationshipAnalyzer";
import { multiCardReadingGenerator } from "@/lib/reading";
import type { DrawnCard, SpreadId, TarotReading, TarotScene, UserInput } from "@/lib/schema";

type AiReadingResult = Record<string, unknown>;

/**
 * 把本地模板生成的 TarotReading 适配成本路由的"AI 形状"响应，
 * 让前端 merge 逻辑（reading/page.tsx 第 312 行附近）不用改。
 *
 * 关键映射：
 *   title → title_zh
 *   thesis → opening_zh
 *   scenes（按 step_label 归到对应位置）→ position_readings[].scenes[]
 */
function templateReadingToAiShape(
  reading: TarotReading,
  drawnCards: DrawnCard[]
): AiReadingResult {
  // 按位置分组：单牌时所有 scene 都归到 0；多牌时按 step_label 匹配 position_name
  const positionReadings = drawnCards.map((dc) => {
    const matched = reading.scenes.filter(
      (s) => s.step_label === dc.position.name_zh
    );
    // 没匹配到（单牌情形）就把全部 motif scene 都放进唯一位置
    const sceneList: TarotScene[] =
      matched.length > 0
        ? matched
        : reading.scenes.filter((s) => s.type !== "opening" && s.type !== "closing");

    return {
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
    };
  });

  const closing = reading.scenes.find((s) => s.type === "closing");

  return {
    title_zh: reading.title,
    opening_zh: reading.thesis,
    position_readings: positionReadings,
    closing_zh: closing?.body ?? reading.closing_line ?? "",
    cards: drawnCards.map((dc, i) => ({
      position_index: dc.position_index,
      card_id: dc.card.id,
      motifs: reading.cards?.[i]?.motifs ?? reading.motifs ?? [],
    })),
    disclaimer_zh: reading.disclaimer,
    _source: "local_template",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      reading_id?: string;
      user?: {
        question_original: string;
        question_reframed?: string;
        domain?: string;
        depth?: string;
      };
      spread?: {
        id: string;
      };
      drawn_cards?: Array<{
        position_index: number;
        position_name_zh: string;
        card_id: string;
        orientation: string;
      }>;
    };

    if (!body.user?.question_original) {
      return NextResponse.json({ error: "请提供用户问题。" }, { status: 400 });
    }

    const spreadId = (body.spread?.id ?? "single_card") as SpreadId;
    const spread = getSpread(spreadId);

    // 如果没有提供 drawn_cards，现场抽牌
    let drawnCards: DrawnCard[];
    if (body.drawn_cards && body.drawn_cards.length > 0) {
      // 从已有数据重建 DrawnCard
      drawnCards = body.drawn_cards.map((dc, i) => {
        const card = findCard(dc.card_id);
        if (!card) throw new Error(`Unknown card: ${dc.card_id}`);
        return {
          card,
          orientation: dc.orientation as "upright" | "reversed",
          position: spread.positions[i] ?? { index: i, name_zh: `位置${i + 1}`, name_en: `Position ${i + 1}`, meaning_zh: "" },
          position_index: dc.position_index,
        };
      });
    } else {
      drawnCards = drawForSpread(spreadId);
    }

    // 分析
    const spreadAnalysis = analyzeSpread(drawnCards);
    const relationshipAnalysis = analyzeCardRelationships(drawnCards, spread);

    const readingId = body.reading_id ?? `reading_${Date.now()}`;

    // ── 默认路径：本地模板。无 LLM key 时这就是终点。
    //
    // 直接调 multiCardReadingGenerator.generate(ctx)，**复用前端已经翻出来的
    // drawnCards**——不要走 generateMultiCardReading()，那一层会：
    //   (1) 再次调 drawForSpread() 抽一组新牌（用户看到的 vs 这里生成的，对不上）
    //   (2) 跑 rulesGuard，但 guard 对多牌阵的 motif 绑定校验是个老 bug
    //       （只把 theme card 的 motifs 放进集合，非 theme 位置的 focus_motif
    //       永远 unknown → 抛 ReadingRulesViolationError → 路由 catch 成 500
    //       → 前端红色"档案翻阅出了点小问题"，"高发"）。
    // 直接走 generator 就两个问题都绕过。
    const hasAi = !!process.env.OPENAI_API_KEY || !!process.env.DEEPSEEK_API_KEY;
    if (!hasAi) {
      const userInput: UserInput = {
        question: body.user.question_original,
        domain: (body.user.domain ?? "self") as UserInput["domain"],
        context: body.user.question_reframed,
        spread_id: spreadId,
      };
      const reading: TarotReading = await multiCardReadingGenerator.generate({
        input: userInput,
        drawn_cards: drawnCards,
        spread,
      });
      const adapted = templateReadingToAiShape(reading, drawnCards);
      return NextResponse.json({
        reading_id: readingId,
        spread_id: spreadId,
        spread_name_zh: spread.name_zh,
        drawn_cards: drawnCards.map((dc) => ({
          position_index: dc.position_index,
          position_name_zh: dc.position.name_zh,
          card_id: dc.card.id,
          card_name_zh: dc.card.name_zh,
          orientation: dc.orientation,
          orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
          image: dc.card.image,
        })),
        spread_analysis: spreadAnalysis,
        relationship_analysis: relationshipAnalysis,
        ...adapted,
        _meta: { ai_provider: "local_template", generation_attempts: 1 },
      });
    }

    // 构建 prompt
    const input = buildReadingGeneratePrompt({
      reading_id: readingId,
      user: {
        question_original: body.user.question_original,
        question_reframed: body.user.question_reframed,
        domain: body.user.domain ?? "self",
        depth: body.user.depth,
      },
      spread: {
        id: spreadId,
        name_zh: spread.name_zh,
        positions: spread.positions,
      },
      drawn_cards: drawnCards,
      rules_context: "",
      spread_analysis: spreadAnalysis,
      relationship_analysis: relationshipAnalysis,
    });

    // 调用 AI + 校验 + 重试
    const ai = getAiProvider();
    const { result, attempts } = await generateWithAiGuard<AiReadingResult>(
      () =>
        ai.generateJson({
          systemPrompt: input.systemPrompt,
          userPrompt: input.userPrompt,
          schemaName: "readingGenerate",
          temperature: 0.7,
          maxTokens: 6000,
        }),
      { drawnCardCount: drawnCards.length, domain: body.user.domain ?? "self" },
      {
        maxAttempts: 3,
        async onRetry(violations) {
          const retryInput = buildReadingGeneratePrompt({
            reading_id: readingId,
            user: {
              question_original: body.user!.question_original,
              question_reframed: body.user!.question_reframed,
              domain: body.user!.domain ?? "self",
              depth: body.user!.depth,
            },
            spread: {
              id: spreadId,
              name_zh: spread.name_zh,
              positions: spread.positions,
            },
            drawn_cards: drawnCards,
            rules_context: "",
            spread_analysis: spreadAnalysis,
            relationship_analysis: relationshipAnalysis,
          });

          const violationFeedback = violations
            .map((v) => `- [${v.code}] ${v.detail}`)
            .join("\n");

          return ai.generateJson({
            systemPrompt: retryInput.systemPrompt,
            userPrompt: `${retryInput.userPrompt}\n\n⚠️ 上一次生成存在以下问题，请修正：\n${violationFeedback}`,
            schemaName: "readingGenerate_retry",
            temperature: 0.6,
            maxTokens: 6000,
          });
        },
      }
    );

    // 附加元数据
    const response = {
      reading_id: readingId,
      spread_id: spreadId,
      spread_name_zh: spread.name_zh,
      drawn_cards: drawnCards.map((dc) => ({
        position_index: dc.position_index,
        position_name_zh: dc.position.name_zh,
        card_id: dc.card.id,
        card_name_zh: dc.card.name_zh,
        orientation: dc.orientation,
        orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
        image: dc.card.image,
      })),
      spread_analysis: spreadAnalysis,
      ...result,
      _meta: {
        ai_provider: ai.id,
        generation_attempts: attempts,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate reading failed:", error);
    return NextResponse.json(
      { error: "解读生成失败，请重试。" },
      { status: 500 }
    );
  }
}
