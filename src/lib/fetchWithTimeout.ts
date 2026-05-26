/**
 * 带超时和重试的 fetch 包装
 *
 * 防止 AI API 卡死导致界面永远 loading。
 */

type FetchWithTimeoutOptions = RequestInit & {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
};

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 30000,
    maxRetries = 1,
    retryDelayMs = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on abort (timeout) — just fail
      if (lastError.name === "AbortError") {
        throw new Error(`请求超时（${timeoutMs / 1000}秒）`);
      }

      // Retry on network error
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("请求失败");
}

/**
 * 带超时的 AI 生成调用
 * 失败后自动降级到本地模板
 */
export async function fetchWithFallback<T>(
  url: string,
  options: FetchWithTimeoutOptions,
  fallback: T
): Promise<{ data: T; fromAI: boolean }> {
  try {
    const res = await fetchWithTimeout(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, fromAI: true };
  } catch (err) {
    console.warn("AI fetch failed, using fallback:", err);
    return { data: fallback, fromAI: false };
  }
}
