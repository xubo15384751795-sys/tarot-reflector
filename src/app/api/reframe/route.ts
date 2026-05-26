/**
 * POST /api/reframe — 问题复述
 */

import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai";
import { buildReframePrompt } from "@/lib/prompts/questionReframe";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      question?: string;
      domain?: string;
      tone?: string;
    };

    if (!body.question?.trim()) {
      return NextResponse.json({ error: "请提供问题。" }, { status: 400 });
    }

    const prompt = buildReframePrompt({
      question: body.question.trim(),
      domain: body.domain ?? "self",
      tone: body.tone,
    });

    const ai = getAiProvider();
    const result = await ai.generateJson({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      schemaName: "questionReframe",
      temperature: 0.6,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reframe failed:", error);
    return NextResponse.json(
      { error: "问题复述失败，请重试。" },
      { status: 500 }
    );
  }
}
