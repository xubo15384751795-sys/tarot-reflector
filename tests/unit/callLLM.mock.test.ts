/**
 * callLLM 单元测试（mock fetch）
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { callLLM } from "@/lib/ai/callLLM";
import { LLMError, LLMProvider } from "@/lib/ai/types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.DEEPSEEK_API_KEY = "test-key";
  process.env.AI_PROVIDER = "deepseek";
});

describe("callLLM", () => {
  it("成功调用返回 content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "你好世界" } }],
      }),
    });

    const result = await callLLM({
      messages: [{ role: "user", content: "你好" }],
    });

    expect(result.content).toBe("你好世界");
    expect(result.provider).toBe("deepseek");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("API 错误抛出 LLMError", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid API key",
    });

    await expect(
      callLLM({
        messages: [{ role: "user", content: "test" }],
      })
    ).rejects.toThrow(LLMError);
  });

  it("缺少 API key 抛出 LLMError", async () => {
    delete process.env.DEEPSEEK_API_KEY;

    await expect(
      callLLM({
        messages: [{ role: "user", content: "test" }],
      })
    ).rejects.toThrow(/Missing DEEPSEEK_API_KEY/);
  });

  it("不支持的 provider 抛出 LLMError", async () => {
    await expect(
      callLLM({
        provider: "claude" as LLMProvider,
        messages: [{ role: "user", content: "test" }],
      })
    ).rejects.toThrow(/Unsupported AI provider/);
  });

  it("json responseFormat 传递给 API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"key":"value"}' } }],
      }),
    });

    await callLLM({
      messages: [{ role: "user", content: "test" }],
      responseFormat: "json",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("abort signal 传递给 fetch", async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "ok" } }],
      }),
    });

    await callLLM({
      messages: [{ role: "user", content: "test" }],
      signal: controller.signal,
    });

    expect(mockFetch.mock.calls[0][1].signal).toBe(controller.signal);
  });
});
