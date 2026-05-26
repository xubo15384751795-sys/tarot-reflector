/**
 * DeepSeek AI Provider
 *
 * DeepSeek API 兼容 OpenAI 格式，直接复用 OpenAI provider。
 */

import { createOpenAiProvider } from "./openai";
import type { AiProvider } from "../types";

export function createDeepSeekProvider(): AiProvider {
  return createOpenAiProvider({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  });
}
