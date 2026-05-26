import { CallLLMOptions, CallLLMResult, LLMError, LLMProvider } from "./types";
import { callDeepSeek } from "./providers/deepseekLLM";
import { callOpenAICompatible } from "./providers/openaiCompatible";

export async function callLLM(options: CallLLMOptions): Promise<CallLLMResult> {
  const provider: LLMProvider =
    options.provider ?? (process.env.AI_PROVIDER as LLMProvider | undefined) ?? "deepseek";

  if (provider === "deepseek") {
    return callDeepSeek(options);
  }
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new LLMError("Missing OPENAI_API_KEY");
    return callOpenAICompatible(
      {
        provider: "openai",
        apiKey,
        baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
      },
      options
    );
  }
  throw new LLMError(`Unsupported AI provider: ${provider}`);
}
