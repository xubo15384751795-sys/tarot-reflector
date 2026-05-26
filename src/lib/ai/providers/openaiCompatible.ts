import { CallLLMOptions, CallLLMResult, LLMError, LLMProvider } from "../types";

type OpenAICompatibleConfig = {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
};

export async function callOpenAICompatible(
  config: OpenAICompatibleConfig,
  options: CallLLMOptions
): Promise<CallLLMResult> {
  const response = await fetch(
    `${config.baseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model ?? config.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 2000,
        response_format:
          options.responseFormat === "json"
            ? { type: "json_object" }
            : undefined
      }),
      signal: options.signal
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new LLMError(
      `LLM request failed: ${response.status} ${response.statusText} ${text}`,
      undefined,
      response.status
    );
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new LLMError("LLM response did not contain message content", json);
  }

  return {
    content,
    model: options.model ?? config.model,
    provider: config.provider,
    raw: json
  };
}
