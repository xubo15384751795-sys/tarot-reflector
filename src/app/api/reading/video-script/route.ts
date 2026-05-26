/**
 * POST /api/reading/video-script — 生成视频分镜脚本
 *
 * 基于已有解读结果，生成适合短视频的 ReadingScript。
 */

import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai";
import { buildVideoScriptPrompt } from "@/lib/prompts/videoScriptGenerate";
import type { TarotReading } from "@/lib/schema";
import type { ReadingScript } from "@/types/readingScript";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      reading?: Record<string, unknown>;
      video_style?: string;
      target_duration?: number;
      aspect_ratio?: string;
    };

    if (!body.reading) {
      return NextResponse.json({ error: "请提供解读数据。" }, { status: 400 });
    }

    const hasAi = !!process.env.OPENAI_API_KEY || !!process.env.DEEPSEEK_API_KEY;
    if (!hasAi) {
      // 无 LLM key：直接告诉前端使用 /demo 路线。短视频生成不强求云端。
      return NextResponse.json(
        {
          error: "本地未配置 LLM。短视频拍摄请使用 /demo 工作台（按 motif 自动播放 + 录屏 + AI 配音）。",
          fallback_route: "/demo",
          _source: "no_ai_key",
        },
        { status: 200 }
      );
    }

    const prompt = buildVideoScriptPrompt({
      reading: body.reading as TarotReading,
      video_style: body.video_style,
      target_duration: body.target_duration ?? 75,
      aspect_ratio: body.aspect_ratio ?? "9:16",
    });

    const ai = getAiProvider();
    const result = await ai.generateJson<ReadingScript>({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      schemaName: "videoScript",
      temperature: 0.7,
      maxTokens: 6000,
    });

    // Attach metadata
    const readingId = (body.reading as Record<string, unknown>).reading_id;
    const script: ReadingScript = {
      ...result,
      reading_id: typeof readingId === "string" ? readingId : `script_${Date.now()}`,
      source_reading_id: typeof readingId === "string" ? readingId : undefined,
      generated_at: new Date().toISOString(),
    } as ReadingScript;

    return NextResponse.json(script);
  } catch (error) {
    console.error("Video script generation failed:", error);
    return NextResponse.json(
      { error: "视频脚本生成失败，请重试。" },
      { status: 500 }
    );
  }
}
