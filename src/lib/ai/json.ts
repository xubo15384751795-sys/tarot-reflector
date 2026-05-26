export function parseJsonObject<T>(content: string): T {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Parsed content is not a JSON object");
    }
    return parsed as T;
  } catch (error) {
    throw new Error(`Failed to parse LLM JSON response: ${(error as Error).message}`);
  }
}
