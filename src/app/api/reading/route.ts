/**
 * POST /api/reading — 生成塔罗解读
 * GET  /api/reading — 接口说明（供接手者参考）
 */

import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_DOMAIN,
  VALID_DOMAINS,
  READING_PROVIDER_ENV,
  LLM_ENV,
} from "@/lib/constants";
import {
  generateReading,
  listReadingGenerators,
  generateMultiCardReading,
} from "@/lib/reading";
import type { SpreadId, UserInput } from "@/lib/schema";

/** GET：返回接口契约，无需鉴权 */
export async function GET() {
  return NextResponse.json({
    name: "塔罗解读 API",
    version: "0.1.0",
    description: "参考样本接口。POST 生成解读，GET 查看契约。",
    endpoints: {
      "POST /api/reading": {
        description: "根据用户问题生成一次解读",
        body: {
          question: "string（必填）用户问题",
          domain:
            "string（可选）love | career | study | project | money | self，默认 self",
          context: "string（可选）补充背景，已预留，AI 引擎会使用",
          spread_id:
            "string（可选）single_card | past_present_trend | situation_obstacle_advice | structural_three | relationship_mirror | celtic_cross，默认 single_card",
          mode:
            "string（可选）daily | question | deep，默认 question",
        },
        response: "TarotReading JSON，结构见 src/lib/schema.ts",
        errors: {
          400: "未提供 question",
          500: "生成失败",
        },
      },
    },
    readingProviders: listReadingGenerators(),
    env: {
      [READING_PROVIDER_ENV]: "template | ai，默认 template",
      [LLM_ENV.API_KEY]: "接 AI 时必填",
      [LLM_ENV.BASE_URL]: "可选，OpenAI 兼容 API 地址",
      [LLM_ENV.MODEL]: "可选，模型名",
    },
    docs: "详见项目根目录 docs/讲解.md",
  });
}

const VALID_SPREAD_IDS: SpreadId[] = [
  "single_card",
  "past_present_trend",
  "situation_obstacle_advice",
  "structural_three",
  "relationship_mirror",
  "celtic_cross",
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<UserInput> &
      Partial<{ mode: string }>;

    if (
      !body.question ||
      typeof body.question !== "string" ||
      body.question.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "请先输入问题。" },
        { status: 400 }
      );
    }

    const domain: UserInput["domain"] =
      body.domain && VALID_DOMAINS.includes(body.domain)
        ? body.domain
        : DEFAULT_DOMAIN;

    const spread_id: SpreadId | undefined =
      body.spread_id && VALID_SPREAD_IDS.includes(body.spread_id)
        ? body.spread_id
        : undefined;

    const mode = body.mode === "daily" || body.mode === "deep" ? body.mode : undefined;

    const input: UserInput = {
      question: body.question.trim(),
      domain,
      context: body.context?.trim() || undefined,
      spread_id,
      mode,
    };

    const reading =
      spread_id && spread_id !== "single_card"
        ? await generateMultiCardReading(input)
        : await generateReading(input);

    return NextResponse.json(reading);
  } catch (error) {
    console.error("Reading generation failed:", error);
    return NextResponse.json(
      { error: "解读生成失败，请重试。" },
      { status: 500 }
    );
  }
}
