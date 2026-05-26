/**
 * POST /api/reading/refine — 用户反馈微调
 */

import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai";
import { buildReadingRefinePrompt } from "@/lib/prompts/readingRefine";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      reading_id?: string;
      user_feedback?: {
        selected_option?: string;
        free_text?: string;
      };
      current_reading_summary?: string;
      target_section?: string;
    };

    if (!body.current_reading_summary) {
      return NextResponse.json({ error: "请提供当前解读摘要。" }, { status: 400 });
    }

    const hasAi = !!process.env.OPENAI_API_KEY || !!process.env.DEEPSEEK_API_KEY;
    if (!hasAi) {
      // 无 LLM key：返回一个温和的本地兜底，不抛 503。
      const selected = body.user_feedback?.selected_option ?? "";
      const free = body.user_feedback?.free_text?.trim() ?? "";
      const refined =
        free.length > 0
          ? `你提到「${free.slice(0, 32)}」——这是一个值得放回原牌阵继续观察的角度。`
          : selected
          ? `你选择的方向是「${selected}」。把这条线索带回去重新读一遍，会有不同的层次。`
          : "再次回到原牌阵，留意你刚才忽略的那一处。";
      return NextResponse.json({
        reading_id: body.reading_id,
        refined_zh: refined,
        target_section: body.target_section ?? "final_advice",
        _source: "local_template",
      });
    }

    const prompt = buildReadingRefinePrompt({
      reading_id: body.reading_id ?? "",
      user_feedback: body.user_feedback ?? {},
      current_reading_summary: body.current_reading_summary,
      target_section: body.target_section ?? "final_advice",
    });

    const ai = getAiProvider();
    const result = await ai.generateJson<Record<string, unknown>>({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      schemaName: "readingRefine",
      temperature: 0.6,
    });

    return NextResponse.json({
      reading_id: body.reading_id,
      ...(result as object),
    });
  } catch (error) {
    console.error("Refine failed:", error);
    return NextResponse.json(
      { error: "解读微调失败，请重试。" },
      { status: 500 }
    );
  }
}
