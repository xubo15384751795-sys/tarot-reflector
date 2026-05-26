/**
 * AI Provider 统一入口
 *
 * 根据 AI_PROVIDER 环境变量选择 provider。
 */

import type { AiProvider } from "./types";
import { createOpenAiProvider } from "./providers/openai";
import { createDeepSeekProvider } from "./providers/deepseek";

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;

  const providerId = (process.env.AI_PROVIDER ?? "openai").toLowerCase();

  switch (providerId) {
    case "deepseek":
      cachedProvider = createDeepSeekProvider();
      break;
    case "openai":
    default:
      cachedProvider = createOpenAiProvider();
      break;
  }

  return cachedProvider;
}

export type { AiProvider, AiGenerateParams } from "./types";
