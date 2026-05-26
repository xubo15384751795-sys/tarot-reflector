/**
 * AI Provider 统一接口
 *
 * 所有 AI 调用都通过此接口，不直接依赖具体厂商 SDK。
 */

export type AiGenerateParams = {
  systemPrompt: string;
  userPrompt: string;
  /** 用于日志和错误追踪 */
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
  /** 传给 API 的 response_format；"json" 时启用 json_object 模式 */
  responseFormat?: "json" | "text";
  signal?: AbortSignal;
};

export interface AiProvider {
  readonly id: string;
  readonly label: string;
  generateJson<T>(params: AiGenerateParams): Promise<T>;
  generateText(params: AiGenerateParams): Promise<string>;
}

export type LLMProvider = "deepseek" | "openai";

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CallLLMOptions = {
  provider?: LLMProvider;
  model?: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
  signal?: AbortSignal;
};

export type CallLLMResult = {
  content: string;
  model: string;
  provider: LLMProvider;
  raw?: unknown;
};

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly status?: number
  ) {
    super(message);
    this.name = "LLMError";
  }
}
