/**
 * Reading 特性内部使用的类型定义。
 *
 * UI 层只允许消费 ReadingScript（与 ReadingScene）。
 * 来自 /api/reading/* 的原始响应必须先经过 normalizeReading 转成 ReadingScript。
 */

import type {
  Domain,
  Motif,
  Orientation,
  QuestionReframe,
  ReadingMode,
  SpreadDefinition,
  SpreadId,
  SpreadRecommendation,
  TarotReading,
  TarotScene,
} from "@/lib/schema";

// ─── UI 状态机 ──────────────────────────────────────

/**
 * Reading 会话状态机。
 * 比旧版 SessionStage 显式：把抽牌阶段 (shuffling / card_revealed) 抬到一级状态，
 * 不再依赖 sub-state drawPhase。
 */
export type ReadingStage =
  // 入口 & 异常
  | "idle"
  | "safety_exit"
  | "error"
  // 问题阶段
  | "question_input"
  | "question_reframing"
  // 牌阵阶段
  | "spread_recommending"
  | "spread_select"
  // 抽牌阶段
  | "shuffling"
  | "card_revealed"
  | "generating_reading"
  | "reading_ready"
  // 解读展开
  | "spread_overview"
  | "position_readings"
  | "relationships"
  | "summary"
  // 收束
  | "reflection_note"
  | "completed";

// ─── API 输入 / 输出 schema（loose typing 的地方在这里收口）──────

export type DrawnCardSnapshot = {
  position_index: number;
  position_name_zh: string;
  card_id: string;
  card_name_zh: string;
  card_name_en: string;
  orientation: Orientation;
  orientation_zh: string;
  image: string;
};

export type SpreadSnapshot = {
  reading_id: string;
  spread_id: SpreadId;
  spread_name_zh: string;
  drawn_cards: DrawnCardSnapshot[];
};

export type ApiPositionScene = {
  type?: TarotScene["type"];
  headline_zh?: string;
  body_zh?: string;
  connection_zh?: string;
  focus_motif?: string | null;
  annotation_label_zh?: string | null;
  duration?: number;
};

export type ApiPositionReading = {
  position_index: number;
  position_name_zh?: string;
  card_id?: string;
  card_name_zh?: string;
  orientation?: Orientation;
  headline_zh?: string;
  body_zh?: string;
  scenes?: ApiPositionScene[];
};

export type ApiSpreadAnalysis = {
  major_arcana_count: number;
  suit_counts: Record<string, number>;
  reversal_count: number;
  element_balance?: Record<string, number>;
  relationship_notes: string[];
};

/**
 * /api/reading/generate 的响应形状。
 * 所有字段都可选——服务器实现/兜底可能省略部分字段。
 */
export type ApiReadingResponse = {
  title_zh?: string;
  opening_zh?: string;
  closing_line_zh?: string;
  disclaimer_zh?: string;
  position_readings?: ApiPositionReading[];
  cards?: Array<{ position_index: number; card_id: string; motifs?: Motif[] }>;
  spread_analysis?: ApiSpreadAnalysis;
};

// ─── 本地兜底 ───────────────────────────────────────

export type LocalCardMeaning = {
  card_id: string;
  name_zh: string;
  orientation: Orientation;
  keywords: string[];
  meaning: string;
};

/**
 * 没拿到 API 时，由本地传统牌义 + draw snapshot 拼出来的 TarotReading。
 * 形状与 API 路径完全一致，方便 UI 一次性消费。
 */
export type LocalFallbackReading = TarotReading;

// ─── UI 唯一消费类型 ─────────────────────────────────

/**
 * UI 层唯一允许消费的类型。
 *
 * 当前为 TarotReading 的别名（保留向下兼容）。
 * 后续如果脚本格式独立演化，可以把这里换成自己的 shape。
 */
export type ReadingScript = TarotReading;
export type ReadingScene = TarotScene;

// ─── 会话状态 ───────────────────────────────────────

export type ReadingSessionInput = {
  mode: ReadingMode;
  question: string;
  domain: Domain;
  context?: string;
};

export type ReadingSessionState = {
  stage: ReadingStage;
  input: ReadingSessionInput;
  reframe: QuestionReframe | null;
  spreadRec: SpreadRecommendation | null;
  selectedSpread: SpreadId | null;
  drawn: SpreadSnapshot | null;
  localMeanings: LocalCardMeaning[];
  script: ReadingScript | null;
  currentPosition: number;
  errorMessage: string | null;
  /**
   * 后台 AI 解读尚未返回。
   *   - true：UI 已经展示了本地兜底 script，可以提示「正在润色…」
   *   - false：要么 AI 已返回并合并、要么彻底失败已用本地兜底
   * 这种「先展示后润色」的两段式让用户在 1.2s 内就能看到牌面，
   * 不需要为 AI 慢响应整段空等。
   */
  aiPending: boolean;
};

// ─── 工具 re-export，方便消费方只看 feature ──────────

export type { SpreadDefinition };
