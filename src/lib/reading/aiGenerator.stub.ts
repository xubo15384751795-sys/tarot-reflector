/**
 * AI 解读生成器（参考实现 / 待接入）
 *
 * 关键改动：现在调用 `generateWithRulesRetry`，规则违规会自动重试 3 次，
 * 每次把上次违规列表追加到 prompt（见 `buildRetryPrompt`）。
 *
 * 当前行为：未配置 LLM_API_KEY 时自动回退到模板引擎。
 *
 * 接入步骤（详见 docs/讲解.md）：
 * 1. 复制 .env.example → .env.local，填入 LLM_API_KEY 等
 * 2. 设置 READING_PROVIDER=ai
 * 3. 在本文件 callLLM(prompt) 中实现 HTTP 调用
 * 4. mergeReadingFromLLM 把模型返回拼成完整 TarotReading
 */

import { LLM_ENV } from "../constants";
import {
  generateWithRulesRetry,
  type Violation,
} from "../rulesGuard";
import type { TarotReading } from "../schema";
import { buildDynamicReadingPrompt, buildRetryPrompt } from "./buildPrompt";
import { mergeReadingFromLLM } from "./mergeReading";
import {
  generateTemplateReading,
  templateReadingGenerator,
} from "./templateGenerator";
import type {
  LLMReadingPayload,
  ReadingContext,
  ReadingGenerator,
} from "./types";
import { validateReading } from "./validateReading";

function hasLlmConfig(): boolean {
  return Boolean(process.env[LLM_ENV.API_KEY]?.trim());
}

/**
 * 调用大模型并解析 JSON。本函数只负责 HTTP + 解析，不做规则校验。
 *
 * TODO（接手者实现）：
 * - 使用 OpenAI / DeepSeek / 通义等兼容 chat/completions 的接口
 * - 要求模型只输出 JSON（见 prompts/dynamic_reading_prompt.txt）
 * - 建议 response_format: { type: "json_object" }（若模型支持）
 */
async function callLLM(prompt: string): Promise<LLMReadingPayload> {
  const apiKey = process.env[LLM_ENV.API_KEY];
  const baseUrl =
    process.env[LLM_ENV.BASE_URL] ?? "https://api.openai.com/v1";
  const model = process.env[LLM_ENV.MODEL] ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("未配置 LLM_API_KEY");
  }

  // —— 参考实现骨架（取消注释并按需修改）——
  //
  // const res = await fetch(`${baseUrl}/chat/completions`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${apiKey}`,
  //   },
  //   body: JSON.stringify({
  //     model,
  //     messages: [{ role: "user", content: prompt }],
  //     response_format: { type: "json_object" },
  //   }),
  // });
  //
  // if (!res.ok) {
  //   throw new Error(`LLM 请求失败: ${res.status}`);
  // }
  //
  // const data = await res.json();
  // const content = data.choices?.[0]?.message?.content;
  // return JSON.parse(content) as LLMReadingPayload;

  void baseUrl;
  void model;
  void prompt;
  throw new Error(
    "AI 引擎尚未实现：请在 src/lib/reading/aiGenerator.stub.ts 的 callLLM() 中补充 HTTP 调用"
  );
}

async function llmOnce(ctx: ReadingContext, prompt: string): Promise<TarotReading> {
  const payload = await callLLM(prompt);
  const reading = mergeReadingFromLLM(ctx, payload);
  validateReading(reading); // 结构校验（字段是否齐全）
  return reading;
}

async function generateWithAi(ctx: ReadingContext) {
  // 用规则守卫的重试机制：首次 + 最多 2 次重试，共 3 次尝试。
  // 每次重试把违规列表追加到 prompt 让模型针对性修正。
  const { reading, attempts } = await generateWithRulesRetry(
    () => llmOnce(ctx, buildDynamicReadingPrompt(ctx)),
    {
      maxAttempts: 3,
      onRetry: (violations: Violation[]) =>
        llmOnce(ctx, buildRetryPrompt(ctx, violations)),
      onAttempt: (report, i) => {
        if (!report.ok) {
          console.warn(
            `[reading.ai] attempt ${i + 1} violated rules:`,
            report.errors.map((e) => e.code).join(", ")
          );
        }
      },
    }
  );
  if (attempts > 1) {
    console.info(`[reading.ai] 解读经 ${attempts} 次尝试后通过规则守卫`);
  }
  return reading;
}

export const aiReadingGenerator: ReadingGenerator = {
  id: "ai",
  label: "LLM 生成",
  async generate(ctx) {
    if (!hasLlmConfig()) {
      console.warn(
        "[reading] READING_PROVIDER=ai 但未配置 LLM_API_KEY，回退到模板引擎"
      );
      return generateTemplateReading(ctx);
    }

    try {
      return await generateWithAi(ctx);
    } catch (err) {
      // 规则违规 + 网络/解析失败都进入这里。
      // 模板兜底，避免用户看到 500；上层 generateReading 会再过一遍守卫。
      console.error("[reading] AI 生成失败，回退到模板:", err);
      return generateTemplateReading(ctx);
    }
  },
};

/** 导出供单元测试或调试 */
export const __testing = {
  callLLM,
  hasLlmConfig,
  templateFallback: templateReadingGenerator,
};
