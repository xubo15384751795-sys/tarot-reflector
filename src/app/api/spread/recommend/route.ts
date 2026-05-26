/**
 * POST /api/spread/recommend — 牌阵推荐
 */

import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai";
import { buildSpreadRecommendPrompt, getDefaultSpreadRecommend } from "@/lib/prompts/spreadRecommendation";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      question?: string;
      domain?: string;
      depth?: string;
    };

    if (!body.question?.trim()) {
      return NextResponse.json({ error: "请提供问题。" }, { status: 400 });
    }

    // 先用规则做默认推荐
    const defaultRec = getDefaultSpreadRecommend(body.domain ?? "self", body.depth);

    // 检查是否配置了 AI
    const hasAi = !!process.env.OPENAI_API_KEY || !!process.env.DEEPSEEK_API_KEY;
    if (!hasAi) {
      return NextResponse.json({
        recommended_spread_id: defaultRec.spread_id,
        recommended_spread_name_zh: defaultRec.spread_name_zh,
        reason_zh: defaultRec.reason_zh,
        alternatives: [],
        _source: "rule_based",
      });
    }

    // 用 AI 增强推荐理由
    const prompt = buildSpreadRecommendPrompt({
      question: body.question.trim(),
      domain: body.domain ?? "self",
      depth: body.depth,
    });

    const ai = getAiProvider();
    const result = await ai.generateJson<Record<string, unknown>>({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      schemaName: "spreadRecommend",
      temperature: 0.5,
    });

    return NextResponse.json({ ...(result as object), _source: "ai_enhanced" });
  } catch (error) {
    console.error("Spread recommend failed:", error);
    // 降级到规则推荐
    const fallback = getDefaultSpreadRecommend("self");
    return NextResponse.json({
      recommended_spread_id: fallback.spread_id,
      recommended_spread_name_zh: fallback.spread_name_zh,
      reason_zh: fallback.reason_zh,
      alternatives: [],
      _source: "fallback",
    });
  }
}
