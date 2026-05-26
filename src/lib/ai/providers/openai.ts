/**
 * OpenAI-compatible AI Provider
 *
 * 支持 OpenAI、Azure OpenAI、以及其他 OpenAI 兼容 API（如本地代理）。
 */

import type { AiGenerateParams, AiProvider } from "../types";

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

export function createOpenAiProvider(
  config: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  } = {}
): AiProvider {
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";
  const baseUrl = (config.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  async function callApi(messages: OpenAIMessage[], temperature: number, maxTokens: number, responseFormat?: "json" | "text"): Promise<string> {
    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY environment variable.");
    }

    const url = new URL(`${baseUrl}/chat/completions`);
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };
    if (responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      // @ts-expect-error Node.js fetch proxy bypass
      agent: undefined,
    });

    if (!res.ok) {
      const bodyText = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${bodyText.slice(0, 200)}`);
    }

    const data: OpenAIResponse = await res.json();
    return data.choices[0]?.message?.content ?? "";
  }

  return {
    id: "openai",
    label: `OpenAI (${model})`,

    async generateJson<T>(params: AiGenerateParams): Promise<T> {
      const messages: OpenAIMessage[] = [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ];

      const raw = await callApi(
        messages,
        params.temperature ?? 0.7,
        params.maxTokens ?? 4096,
        params.responseFormat
      );

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, raw];
      const jsonStr = (jsonMatch[1] ?? raw).trim();

      try {
        return JSON.parse(jsonStr) as T;
      } catch (e) {
        throw new Error(`Failed to parse AI JSON response for ${params.schemaName}: ${(e as Error).message}\nRaw: ${jsonStr.slice(0, 500)}`);
      }
    },

    async generateText(params: AiGenerateParams): Promise<string> {
      const messages: OpenAIMessage[] = [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ];

      return callApi(
        messages,
        params.temperature ?? 0.7,
        params.maxTokens ?? 4096
      );
    },
  };
}
