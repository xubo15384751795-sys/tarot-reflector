"use client";

/**
 * Reading 会话状态机。
 *
 * 单一来源：所有阶段切换、抽牌结果、解读脚本、当前位置都收口在这里。
 * UI 通过 `state.stage` 判断渲染哪个 Stage 组件。
 *
 * 状态机迁移摘要：
 *   idle / safety_exit / error
 *     → question_reframing → spread_recommending → spread_select?
 *     → shuffling → card_revealed
 *     → spread_overview? → position_readings
 *     → relationships? → summary
 *     → reflection_note? → completed
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzeInput } from "@/lib/reading/inputAnalyzer";
import { reframeQuestion } from "@/lib/reading/reframeQuestion";
import { normalizeReading } from "../lib/normalizeReading";
import { lookupLocalMeaning } from "../lib/lookupLocalMeaning";
import {
  countRecentReadingsForQuestion,
  RUMINATION_THRESHOLD,
} from "../lib/ruminationCheck";
import { useReadingApi } from "./useReadingApi";
import type {
  LocalCardMeaning,
  ReadingScript,
  ReadingSessionInput,
  ReadingSessionState,
  ReadingStage,
  SpreadSnapshot,
} from "../types/reading";
import type { Orientation, SpreadId } from "@/lib/schema";

// ─── 持久化 ───────────────────────────────────
// 当前会话用 URL signature 当 key：换了问题/domain/mode 就不会错配。
// 完整 state 体积大约 5–15 KB，写到 localStorage 没压力。

const SESSION_STORAGE_KEY = "tarot:session:current";
const HISTORY_STORAGE_KEY = "tarot:reading:history";
const HISTORY_MAX = 30;

type PersistedSession = {
  /** URL signature；不匹配就丢弃，相当于"新一轮" */
  key: string;
  /** 序列化的 state（去掉 inflightAiRef 之类不可序列化的部分） */
  state: ReadingSessionState;
  /** 写入时间，用于过期清理 */
  savedAt: number;
};

function sessionKeyOf(input: ReadingSessionInput): string {
  return `${input.mode}|${input.question}|${input.domain}|${input.context ?? ""}`;
}

function loadPersistedSession(
  input: ReadingSessionInput,
): ReadingSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (parsed.key !== sessionKeyOf(input)) return null;
    // 1 天过期，避免刷出陈年旧 state
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) return null;
    // rehydrate 时强制 pending 态清零（任何 inflight 解读都已经断了）
    return { ...parsed.state, aiPending: false, readingSlowHint: false };
  } catch {
    return null;
  }
}

function persistSession(
  input: ReadingSessionInput,
  state: ReadingSessionState,
): void {
  if (typeof window === "undefined") return;
  try {
    // 只写有意义的阶段，避免 question_reframing 这种瞬时态
    // 占座（一刷新就回来，反而打断用户思路）
    const worthPersisting: ReadingStage[] = [
      "card_revealed",
      "spread_overview",
      "position_readings",
      "relationships",
      "summary",
    ];
    if (!worthPersisting.includes(state.stage)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    const payload: PersistedSession = {
      key: sessionKeyOf(input),
      state,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* localStorage 不可用，静默 */
  }
}

function pushHistorySnapshot(state: ReadingSessionState): void {
  if (typeof window === "undefined" || !state.script) return;
  try {
    const existing = JSON.parse(
      localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]",
    ) as Array<{
      savedAt: string;
      reading_id?: string;
      question: string;
      domain: string;
      script: ReadingScript;
    }>;
    // reading_id 在 SpreadSnapshot 上，不在 script 自身
    const reading_id = state.drawn?.reading_id;
    // 同一 reading_id 已存过就不重复（避免 summary 多次进入时重复）
    if (reading_id && existing.some((h) => h.reading_id === reading_id)) return;
    existing.unshift({
      savedAt: new Date().toISOString(),
      reading_id,
      question: state.input.question,
      domain: state.input.domain,
      script: state.script,
    });
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(existing.slice(0, HISTORY_MAX)),
    );
  } catch {
    /* silent */
  }
}

/**
 * 生成解读的超时时间，按牌数放大。
 *
 * 原来是固定 30s。实测（deepseek-v4-flash）：单牌 ~21s、三牌 ~25s、
 * 凯尔特十字（10 张）**正好 30.0s** —— 卡在超时边界上被 abort，
 * 用户拿到的是本地字典牌义，而界面只说「有点慢」。
 * 牌越多越慢，超时也必须跟着牌数走。
 */
function generateTimeoutFor(cardCount: number): number {
  return 20_000 + cardCount * 8_000;
}

const initialState = (input: ReadingSessionInput): ReadingSessionState => {
  const startStage: ReadingStage = (() => {
    if (input.mode !== "daily" && input.question) {
      const signals = analyzeInput(input.question);
      if (signals.crisis) return "safety_exit";
    }
    return input.mode === "daily" ? "shuffling" : "question_reframing";
  })();

  const reframe =
    input.mode !== "daily" && input.question
      ? reframeQuestion(input.question, input.domain)
      : null;

  return {
    stage: startStage,
    input,
    reframe,
    spreadRec: null,
    selectedSpread: null,
    drawn: null,
    localMeanings: [],
    script: null,
    currentPosition: 0,
    errorMessage: null,
    aiPending: false,
    readingSlowHint: false,
  };
};

export type UseReadingSession = {
  state: ReadingSessionState;
  // 阶段切换
  goTo: (stage: ReadingStage) => void;
  setStage: (stage: ReadingStage) => void;
  // 问题阶段
  acceptReframe: () => void;
  /** 拒绝系统给出的复述，直接用 original question 抽牌 */
  skipReframe: () => void;
  editQuestion: () => void;
  // 牌阵阶段
  selectSpread: (spreadId: SpreadId) => void;
  confirmSpread: () => Promise<void>;
  openManualSpread: () => void;
  backToReframe: () => void;
  /** 反刍护栏：用户决定无视提醒、继续抽牌 */
  overrideRumination: () => Promise<void>;
  // 抽牌阶段
  drawForDaily: () => Promise<void>;
  drawForSpread: (spreadId: string) => Promise<void>;
  advanceFromCardRevealed: () => void;
  // 解读阶段
  nextPosition: () => void;
  /** 卷轴滚动时回报当前正在读的是第几张（幂等，不改 stage） */
  focusPosition: (index: number) => void;
  beginPositionReadings: () => void;
  goSummary: () => void;
  replay: () => void;
  // 兜底
  reset: () => void;
};

export function useReadingSession(input: ReadingSessionInput): UseReadingSession {
  const api = useReadingApi();
  const [state, setState] = useState<ReadingSessionState>(() =>
    initialState(input),
  );
  // rehydrate 在 useEffect 里做，保证 server/client 首次渲染一致，避免 hydration mismatch
  const rehydratedRef = useRef(false);
  useEffect(() => {
    if (rehydratedRef.current) return;
    rehydratedRef.current = true;
    const restored = loadPersistedSession(input);
    if (restored) setState(restored);
  }, [input]);
  /**
   * 当前正在进行的 AI 生成任务标识。
   *   - 用 Symbol 是因为字符串/数字会在 strict mode 下双次 invoke 时撞车
   *   - 任务真正落地时，对比这个 ref：如果中途被 reset() 切走，
   *     旧请求的 then 回调会发现自己不再 inflight，安静丢弃
   */
  const inflightAiRef = useRef<symbol | null>(null);

  // 持久化：每次 state 变化都写一次（小体积），但只在"值得保留"的阶段
  useEffect(() => {
    persistSession(input, state);
  }, [input, state]);

  // 达到 summary 时把 reading 快照塞进 history（供 /notes 等场景用）
  const summaryArchivedRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.stage !== "summary" || !state.script || !state.drawn) return;
    const id = state.drawn.reading_id;
    if (summaryArchivedRef.current === id) return;
    summaryArchivedRef.current = id;
    pushHistorySnapshot(state);
  }, [state]);

  // 进入 question_reframing 阶段时同步推荐牌阵
  useEffect(() => {
    if (state.stage !== "question_reframing") return;
    const depth = input.mode === "deep" ? "deep" : "standard";
    const rec = api.recommendSpread(input.question, input.domain, depth);
    setState((s) => ({ ...s, spreadRec: rec }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage, input.question, input.domain, input.mode]);

  // ─── 阶段切换 ──────────────────────────────
  const setStage = useCallback((stage: ReadingStage) => {
    setState((s) => ({ ...s, stage }));
  }, []);
  const goTo = setStage;

  const acceptReframe = useCallback(() => {
    setState((s) =>
      s.spreadRec
        ? {
            ...s,
            selectedSpread: s.spreadRec.spread_id,
            stage: "spread_recommending",
          }
        : { ...s, stage: "spread_recommending" },
    );
  }, []);

  /**
   * 用户拒绝复述："这个观察不太像我"。
   * 流程同 acceptReframe，但把 reframe 字段清空——下游任何展示
   * "你接受的复述" 的 UI 都不会再渲染那一段。
   * 不弹回首页、不丢已有的 spreadRec，保留 user agency。
   */
  const skipReframe = useCallback(() => {
    setState((s) => ({
      ...s,
      reframe: null,
      selectedSpread: s.spreadRec?.spread_id ?? s.selectedSpread,
      stage: "spread_recommending",
    }));
  }, []);

  const editQuestion = useCallback(() => {
    // 占位：当前 UI 直接把用户拉回首页，由调用方处理
    setState((s) => ({ ...s, stage: "question_input" }));
  }, []);

  const selectSpread = useCallback((spreadId: SpreadId) => {
    setState((s) => ({ ...s, selectedSpread: spreadId }));
  }, []);

  const openManualSpread = useCallback(() => {
    setState((s) => ({ ...s, stage: "spread_select" }));
  }, []);

  const backToReframe = useCallback(() => {
    setState((s) => ({ ...s, stage: "question_reframing" }));
  }, []);

  // ─── 抽牌共用 ──────────────────────────────
  /**
   * 两段式抽牌 + 生成。
   *
   * 旧实现里 anim + AI 在 Promise.all 里强行同步等待，AI 慢的时候
   * 用户卡在洗牌动画上看 20–30 秒。这里改成：
   *
   *   ① 抽牌 + 1.2s 洗牌动画 → 立刻用「本地兜底牌义」组装 script，
   *      切到 card_revealed/revealedStage，用户马上看到牌面。
   *   ② 同时 fire-and-forget 调 AI；返回后把 script 替换成 AI 版。
   *      期间 state.aiPending = true，UI 提示「正在把牌面与你的问题连起来……」。
   *   ③ 如果 AI 报错或返回 null，aiPending 翻回 false；超时则显示 readingSlowHint。
   *   ④ 如果用户中途 reset()，inflightAiRef 切换，旧 AI 回调会丢弃自己。
   */
  const runDrawAndGenerate = useCallback(
    async (
      spreadId: string,
      opts: {
        /** daily 模式覆盖 spread_name_zh */
        spreadNameOverride?: string;
        /** generate 时传给后端的 question / domain，可与会话不同 */
        generationContext?: { question: string; domain: string };
        /** card_revealed 时把会话设置为这个阶段 */
        revealedStage?: ReadingStage;
      },
    ) => {
      setState((s) => ({
        ...s,
        stage: "shuffling",
        errorMessage: null,
        aiPending: false,
        readingSlowHint: false,
      }));
      try {
        // 1) 本地抽牌（瞬时）
        const drawn = (await api.drawCards(spreadId, true)) as SpreadSnapshot;
        const genCtx = opts.generationContext ?? {
          question: input.question,
          domain: input.domain,
        };

        // 2) 启动 AI 生成（后台 / fire-and-forget）
        const ticket = Symbol("ai-gen");
        inflightAiRef.current = ticket;
        const genPromise = api.generateReading({
          readingId: drawn.reading_id,
          questionOriginal: genCtx.question,
          domain: genCtx.domain,
          spreadId,
          drawnCards: drawn.drawn_cards,
          timeoutMs: generateTimeoutFor(drawn.drawn_cards.length),
        });

        // 3) 1.2s 洗牌动画
        await new Promise<void>((r) => setTimeout(r, 1200));

        // 4) 本地兜底牌义（card_revealed 即时展示用）
        const meanings: LocalCardMeaning[] = drawn.drawn_cards
          .map((dc) =>
            lookupLocalMeaning(dc.card_id, dc.orientation as Orientation),
          )
          .filter((m): m is LocalCardMeaning => m !== null);

        // 5) 即刻用本地兜底拼一个 script，切阶段
        const localScript: ReadingScript = normalizeReading({
          api: null,
          draw: drawn,
          meanings,
          spreadId: spreadId as SpreadId,
          domain: genCtx.domain,
          spreadNameOverride: opts.spreadNameOverride,
        });
        setState((s) => ({
          ...s,
          drawn,
          localMeanings: meanings,
          script: localScript,
          stage: opts.revealedStage ?? "card_revealed",
          aiPending: true,
        }));

        // 6) AI 返回后把 script 替换为合并后的版本
        genPromise
          .then((genData) => {
            if (inflightAiRef.current !== ticket) return; // 已被 reset 或新一轮替换
            if (!genData) {
              // 超时或失败：保留本地 script，提示用户先看牌面
              setState((s) => ({
                ...s,
                aiPending: false,
                readingSlowHint: true,
              }));
              return;
            }
            const merged: ReadingScript = normalizeReading({
              api: genData,
              draw: drawn,
              meanings,
              spreadId: spreadId as SpreadId,
              domain: genCtx.domain,
              spreadNameOverride: opts.spreadNameOverride,
            });
            setState((s) => ({
              ...s,
              script: merged,
              aiPending: false,
              readingSlowHint: false,
            }));
          })
          .catch((err) => {
            if (inflightAiRef.current !== ticket) return;
            console.error("AI generation failed:", err);
            setState((s) => ({
              ...s,
              aiPending: false,
              readingSlowHint: true,
            }));
          });
      } catch (err) {
        console.error("Draw failed:", err);
        inflightAiRef.current = null;
        setState((s) => ({
          ...s,
          stage: "error",
          errorMessage: err instanceof Error ? err.message : "抽牌失败",
          aiPending: false,
          readingSlowHint: false,
        }));
      }
    },
    [api, input.question, input.domain],
  );

  const drawForDaily = useCallback(async () => {
    await runDrawAndGenerate("single_card", {
      spreadNameOverride: "单牌解读",
      generationContext: { question: "今日气息", domain: "self" },
      // daily 走和其它模式一样的 card_revealed —— 翻牌这一刻由 DrawingStage
      // 统一负责，position_readings 只负责「读」，不再重复画一次牌。
      revealedStage: "card_revealed",
    });
  }, [runDrawAndGenerate]);

  const drawForSpread = useCallback(
    async (spreadId: string) => {
      await runDrawAndGenerate(spreadId, {});
    },
    [runDrawAndGenerate],
  );

  const confirmSpread = useCallback(async () => {
    if (!state.selectedSpread) return;
    // 反刍护栏：24h 内同问题 ≥ 阈值，先暂停一下让用户重新决定
    const recentCount = countRecentReadingsForQuestion(input.question);
    if (recentCount >= RUMINATION_THRESHOLD) {
      setState((s) => ({ ...s, stage: "rumination_pause" }));
      return;
    }
    await drawForSpread(state.selectedSpread);
  }, [state.selectedSpread, drawForSpread, input.question]);

  /** 用户在 rumination_pause 上按 "我知道，但我想再看一次" */
  const overrideRumination = useCallback(async () => {
    if (!state.selectedSpread) return;
    await drawForSpread(state.selectedSpread);
  }, [state.selectedSpread, drawForSpread]);

  // daily 模式：进入后自动抽牌（只跑一次）
  useEffect(() => {
    if (input.mode !== "daily") return;
    if (state.stage !== "shuffling") return;
    if (state.drawn) return; // 已抽过
    drawForDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.mode, state.stage, state.drawn]);

  // ─── 抽牌后跳转 ──────────────────────────────
  const advanceFromCardRevealed = useCallback(() => {
    setState((s) => {
      const cardCount = s.script?.cards.length ?? 0;
      const next: ReadingStage =
        input.mode === "daily" || cardCount <= 1
          ? "position_readings"
          : "spread_overview";
      return { ...s, stage: next };
    });
  }, [input.mode]);

  // ─── 解读流转 ──────────────────────────────
  const beginPositionReadings = useCallback(() => {
    setState((s) => ({ ...s, currentPosition: 0, stage: "position_readings" }));
  }, []);

  const nextPosition = useCallback(() => {
    setState((s) => {
      const cardCount = s.script?.cards.length ?? 0;
      if (s.currentPosition < cardCount - 1) {
        return { ...s, currentPosition: s.currentPosition + 1 };
      }
      // 多牌 + 有 analysis → 关系；否则直接 summary
      if (cardCount > 1 && s.script?.analysis) {
        return { ...s, stage: "relationships" };
      }
      return { ...s, stage: "summary" };
    });
  }, []);

  /**
   * 卷轴滚到某一段时回报。只动 currentPosition，不动 stage ——
   * 用户往回滚看前一张，不应该把会话状态也倒回去。
   */
  const focusPosition = useCallback((index: number) => {
    setState((s) =>
      s.currentPosition === index ? s : { ...s, currentPosition: index },
    );
  }, []);

  const goSummary = useCallback(() => {
    setState((s) => (s.stage === "summary" ? s : { ...s, stage: "summary" }));
  }, []);

  const replay = useCallback(() => {
    setState((s) => ({ ...s, currentPosition: 0, stage: "position_readings" }));
  }, []);

  const reset = useCallback(() => {
    // 让任何 inflight AI 回调判空丢弃
    inflightAiRef.current = null;
    setState(initialState(input));
  }, [input]);

  return useMemo<UseReadingSession>(
    () => ({
      state,
      goTo,
      setStage,
      acceptReframe,
      skipReframe,
      editQuestion,
      selectSpread,
      confirmSpread,
      openManualSpread,
      backToReframe,
      overrideRumination,
      drawForDaily,
      drawForSpread,
      advanceFromCardRevealed,
      nextPosition,
      focusPosition,
      beginPositionReadings,
      goSummary,
      replay,
      reset,
    }),
    [
      state,
      goTo,
      setStage,
      acceptReframe,
      skipReframe,
      editQuestion,
      selectSpread,
      confirmSpread,
      overrideRumination,
      openManualSpread,
      backToReframe,
      drawForDaily,
      drawForSpread,
      advanceFromCardRevealed,
      nextPosition,
      focusPosition,
      beginPositionReadings,
      goSummary,
      replay,
      reset,
    ],
  );
}
