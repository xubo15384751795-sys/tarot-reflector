import { CallLLMOptions, CallLLMResult, LLMError } from "../types";
import { callOpenAICompatible } from "./openaiCompatible";

export async function callDeepSeek(options: CallLLMOptions): Promise<CallLLMResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new LLMError("Missing DEEPSEEK_API_KEY");
  }
  return callOpenAICompatible(
    {
      provider: "deepseek",
      apiKey,
      baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat"
    },
    options
  );
}
