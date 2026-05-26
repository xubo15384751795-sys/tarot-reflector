"use client";

/**
 * /api/reading/* 的客户端封装。
 *
 * - reframe / recommendSpread 走本地纯函数
 * - drawCards / generateReading / refineReading 走带超时的 fetch
 *
 * 所有方法都 return Promise，使用方负责异常处理。
 */

import { useCallback, useMemo } from "react";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { reframeQuestion } from "@/lib/reading/reframeQuestion";
import { recommendSpread } from "@/lib/reading/recommendSpread";
import type {
  Domain,
  QuestionReframe,
  SpreadRecommendation,
} from "@/lib/schema";
import type { ReadingScript as VideoReadingScript } from "@/types/readingScript";
import type {
  ApiReadingResponse,
  ReadingScript,
  SpreadSnapshot,
} from "../types/reading";

export type RecommendSpreadDepth = "quick" | "standard" | "deep";

export type GenerateReadingInput = {
  readingId: string;
  questionOriginal: string;
  domain: string;
  spreadId: string;
  drawnCards: SpreadSnapshot["drawn_cards"];
  /** 默认 30s */
  timeoutMs?: number;
};

export type RefineReadingInput = {
  readingId: string;
  currentReadingSummary: string;
  targetSection?: string;
  feedback?: {
    selected_option?: string;
    free_text?: string;
  };
  timeoutMs?: number;
};

export type RefineReadingResponse = {
  reading_id?: string;
  refined_zh: string;
  target_section: string;
};

export type VideoScriptInput = {
  script: ReadingScript;
  videoStyle?: string;
  targetDuration?: number;
};

/** SSE 事件回调签名 */
export type StreamEventHandlers = {
  onMeta?: (meta: Record<string, unknown>) => void;
  onPosition?: (position: Record<string, unknown>) => void;
  onDone?: (final: Record<string, unknown>) => void;
  onError?: (err: { message: string }) => void;
};

export type ReadingApi = {
  reframe: (question: string, domain: Domain) => QuestionReframe;
  recommendSpread: (
    question: string,
    domain: Domain,
    depth: RecommendSpreadDepth,
  ) => SpreadRecommendation;
  drawCards: (spreadId: string, allowReversed?: boolean) => Promise<SpreadSnapshot>;
  generateReading: (input: GenerateReadingInput) => Promise<ApiReadingResponse | null>;
  /**
   * SSE 流式生成。和 generateReading 同 input；按 meta → position(N) → done
   * 顺序触发 handlers。返回 abort 函数（前端切走或重置会话时调用）。
   */
  generateReadingStream: (
    input: GenerateReadingInput,
    handlers: StreamEventHandlers,
  ) => { abort: () => void };
  refineReading: (input: RefineReadingInput) => Promise<RefineReadingResponse | null>;
  generateVideoScript: (input: VideoScriptInput) => Promise<VideoReadingScript>;
};

export function useReadingApi(): ReadingApi {
  const drawCards = useCallback<ReadingApi["drawCards"]>(
    async (spreadId, allowReversed = true) => {
      const res = await fetch("/api/reading/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spread_id: spreadId, allow_reversed: allowReversed }),
      });
      if (!res.ok) throw new Error("抽牌失败");
      return (await res.json()) as SpreadSnapshot;
    },
    [],
  );

  const generateReading = useCallback<ReadingApi["generateReading"]>(
    async ({
      readingId,
      questionOriginal,
      domain,
      spreadId,
      drawnCards,
      timeoutMs = 30000,
    }) => {
      try {
        const res = await fetchWithTimeout("/api/reading/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reading_id: readingId,
            user: { question_original: questionOriginal, domain },
            spread: { id: spreadId },
            drawn_cards: drawnCards,
          }),
          timeoutMs,
          maxRetries: 0,
        });
        if (!res.ok) return null;
        return (await res.json()) as ApiReadingResponse;
      } catch {
        return null;
      }
    },
    [],
  );

  const generateReadingStream = useCallback<ReadingApi["generateReadingStream"]>(
    (input, handlers) => {
      const controller = new AbortController();

      // 用 fetch + ReadableStream reader 解析 SSE，比 EventSource 灵活
      // （EventSource 不支持 POST body）。
      (async () => {
        try {
          const res = await fetch("/api/reading/generate/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reading_id: input.readingId,
              user: {
                question_original: input.questionOriginal,
                domain: input.domain,
              },
              spread: { id: input.spreadId },
              drawn_cards: input.drawnCards,
            }),
            signal: controller.signal,
          });

          if (!res.ok || !res.body) {
            handlers.onError?.({ message: `stream failed: ${res.status}` });
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          // 简易 SSE 解析：按 "\n\n" 分块，每块解 event: / data: 两行
          // 不实现 retry / id —— 这条连接没必要
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let sep = buffer.indexOf("\n\n");
            while (sep !== -1) {
              const chunk = buffer.slice(0, sep);
              buffer = buffer.slice(sep + 2);
              sep = buffer.indexOf("\n\n");

              let event = "message";
              let data = "";
              for (const line of chunk.split("\n")) {
                if (line.startsWith("event: ")) event = line.slice(7).trim();
                else if (line.startsWith("data: ")) data += line.slice(6);
              }
              if (!data) continue;
              try {
                const parsed = JSON.parse(data) as Record<string, unknown>;
                switch (event) {
                  case "meta":
                    handlers.onMeta?.(parsed);
                    break;
                  case "position":
                    handlers.onPosition?.(parsed);
                    break;
                  case "done":
                    handlers.onDone?.(parsed);
                    break;
                  case "error":
                    handlers.onError?.(
                      parsed as { message: string },
                    );
                    break;
                }
              } catch {
                /* 单帧解析失败：跳过，不影响后续 */
              }
            }
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          handlers.onError?.({
            message: err instanceof Error ? err.message : "stream error",
          });
        }
      })();

      return { abort: () => controller.abort() };
    },
    [],
  );

  const refineReading = useCallback<ReadingApi["refineReading"]>(
    async ({
      readingId,
      currentReadingSummary,
      targetSection,
      feedback,
      timeoutMs = 30000,
    }) => {
      try {
        const res = await fetchWithTimeout("/api/reading/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reading_id: readingId,
            user_feedback: feedback ?? {},
            current_reading_summary: currentReadingSummary,
            target_section: targetSection ?? "final_advice",
          }),
          timeoutMs,
          maxRetries: 0,
        });
        if (!res.ok) return null;
        return (await res.json()) as RefineReadingResponse;
      } catch {
        return null;
      }
    },
    [],
  );

  const generateVideoScript = useCallback<ReadingApi["generateVideoScript"]>(
    async ({ script, videoStyle = "moonlight_archive", targetDuration = 75 }) => {
      const res = await fetch("/api/reading/video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reading: script,
          video_style: videoStyle,
          target_duration: targetDuration,
        }),
      });
      if (!res.ok) throw new Error("生成失败");
      return (await res.json()) as VideoReadingScript;
    },
    [],
  );

  return useMemo<ReadingApi>(
    () => ({
      reframe: (question, domain) => reframeQuestion(question, domain),
      recommendSpread: (question, domain, depth) =>
        recommendSpread(question, domain, depth),
      drawCards,
      generateReading,
      generateReadingStream,
      refineReading,
      generateVideoScript,
    }),
    [
      drawCards,
      generateReading,
      generateReadingStream,
      refineReading,
      generateVideoScript,
    ],
  );
}
