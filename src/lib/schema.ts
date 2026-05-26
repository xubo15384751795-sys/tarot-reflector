/**
 * 核心类型定义 — v2: 支持 78 张牌、多牌阵、完整规则层
 *
 * 描述一次塔罗解读的完整数据结构：用户输入、抽牌结果、牌阵、
 * 分步场景（scene）、牌面元素标注（motif）等。前后端共用此 schema。
 */

// ─── 基础类型 ───

export type SceneType =
  | "opening"
  | "card_analysis"
  | "relationship_analysis"
  | "spread_synthesis"
  | "mapping"
  | "closing";

export type Orientation = "upright" | "reversed";

export type Domain = "love" | "career" | "study" | "project" | "money" | "self";

export type Bbox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Motif = {
  id: string;
  /** @deprecated 档案库优先用 label_zh */
  label: string;
  /** @deprecated 档案库优先用 meaning_zh */
  meaning: string;
  /** 档案库展签标题 */
  label_zh?: string;
  /** 档案库展签简述（一句话总结） */
  meaning_zh?: string;
  /** RWS 传统注释（更长一段） */
  traditional_note_zh?: string;
  bbox: Bbox;
  /** 牌面锚点（归一化坐标 0–1） */
  anchor?: { x: number; y: number };
  /** 牌面柔和高亮（归一化 0–1）；默认沿用 bbox */
  highlight?: { x: number; y: number; w: number; h: number; shape?: "rect" | "oval" };
  /** 浮动注释卡位置偏好；默认根据 anchor.x 自动决定 */
  popover?: { side?: "left" | "right" | "top" | "bottom"; offsetX?: number; offsetY?: number };
  /**
   * 坐标精确度。
   *   precise     — 手工标注，bbox/anchor 与牌面元素严格对齐（如大阿尔卡那）
   *   approximate — 批量生成的近似坐标（如小阿尔卡那 56 张）
   *   未设置时默认按 precise 渲染。
   */
  precision?: "precise" | "approximate";
  /** 数据来源 */
  source?: "manual" | "script_generated" | "ai_assisted";
  /** 数据质量等级 */
  quality?: "verified" | "needs_review" | "rough";
  /** 校准时间 */
  reviewed_at?: string;
  /** 校准人 */
  reviewed_by?: string;
  /** 旧版字段：side + order 纵向堆叠；y 为旧版绝对定位 */
  note?: { side: "left" | "right"; order?: number; y?: number };
};

// ─── 牌组类型 ───

export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type CourtRank = "page" | "knight" | "queen" | "king";
export type Arcana = "major" | "minor";

export type CardData = {
  id: string;
  name_zh: string;
  name_en: string;
  arcana: Arcana;
  suit?: Suit;
  number?: number | null;
  court_rank?: CourtRank;
  image: string;
  traditional: {
    upright: {
      keywords_zh: string[];
      meaning_zh: string;
    };
    reversed: {
      keywords_zh: string[];
      meaning_zh: string;
    };
  };
  symbolic_components: {
    suit_rule_zh?: string;
    number_rule_zh?: string;
    court_rule_zh?: string;
    combined_rule_zh: string;
  };
  domain_mapping: Record<string, string>;
  source: {
    deck: string;
    image_source: string;
  };
};

// ─── 牌阵类型 ───

export type SpreadId =
  | "single_card"
  | "past_present_trend"
  | "situation_obstacle_advice"
  | "structural_three"
  | "relationship_mirror"
  | "celtic_cross";

export type SpreadPosition = {
  index: number;
  name_zh: string;
  name_en: string;
  meaning_zh: string;
  warning?: string;
};

export type SpreadDefinition = {
  id: SpreadId;
  name_zh: string;
  name_en: string;
  card_count: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  description_zh: string;
  positions: SpreadPosition[];
  protection_rules?: string[];
  relationship_rules?: string[];
};

// ─── 抽牌结果 ───

export type DrawnCard = {
  card: CardData;
  orientation: Orientation;
  position: SpreadPosition;
  position_index: number;
};

// ─── 解读上下文 ───

export type ReadingContext = {
  input: UserInput;
  spread: SpreadDefinition;
  drawn_cards: DrawnCard[];
  /** 从 rules/ 加载的规则上下文 */
  rules: {
    suits: Record<string, { name_zh: string; element_zh: string; core_zh: string }>;
    numbers: Record<string, { name_zh: string; core_zh: string }>;
    court_cards: Record<string, { name_zh: string; stage_zh: string; mode_zh: string }>;
    orientations: {
      upright: { rule_zh: string };
      reversed: { rule_zh: string; interpretation_modes: Array<{ mode: string; description_zh: string }> };
    };
    relationship_rules: Record<string, { rule_zh: string }>;
  };
};

// ─── 场景类型 ───

export type TarotScene = {
  scene_id: number;
  type: SceneType;
  step_label: string;
  headline: string;
  subtitle?: string;
  insight?: string;
  body: string;
  connection?: string;
  visual_direction: string;
  duration: number;
  /** 该场景聚焦的牌（多牌阵中） */
  focus_card_id?: string | null;
  /** 该场景聚焦的 motif */
  focus_motif?: string | null;
  annotation_label?: string | null;
  /** 该场景关联的牌阵位置 */
  position_name?: string | null;
};

// ─── 用户输入 ───

export type ReadingMode = "daily" | "question" | "deep";

export type UserInput = {
  question: string;
  domain: Domain;
  context?: string;
  /** 牌阵选择，默认 single_card */
  spread_id?: SpreadId;
  /** 阅读模式 */
  mode?: ReadingMode;
};

/** 问题复述 — 用于 QuestionReframe 步骤 */
export type QuestionReframe = {
  original: string;
  tension: string;
  reframed: string;
};

/** 牌阵推荐结果 */
export type SpreadRecommendation = {
  spread_id: SpreadId;
  reason_zh: string;
  alternatives: SpreadId[];
};

/** 会话流程阶段 */
export type SessionStage =
  | "safety_exit"
  | "reframing"
  | "spread_choice"
  | "spread_select"
  | "drawing"
  | "spread_overview"
  | "position_readings"
  | "relationships"
  | "summary"
  | "reflection"
  | "done";

// ─── 旧版兼容（单牌） ───

export type CardDrawResult = {
  card_name: string;
  zh_name: string;
  id: string;
  orientation: Orientation;
  core_symbols: string[];
  upright_meaning: string;
  reversed_meaning: string;
  domain_meaning: string;
  risk: string[];
  advice: string[];
  visual_motifs: string[];
  motifs: Motif[];
  image: string;
};

// ─── 解读结果 ───

export type TarotReading = {
  title: string;
  thesis: string;
  /** 牌阵信息 */
  spread_id: SpreadId;
  spread_name_zh: string;
  /** 抽到的牌（支持多张） */
  cards: Array<{
    card_id: string;
    card_name: string;
    zh_name: string;
    orientation: Orientation;
    image: string;
    position_name: string;
    position_index: number;
    motifs: Motif[];
  }>;
  /** 单牌兼容字段 */
  card_id: string;
  card_name: string;
  zh_name: string;
  orientation: Orientation;
  domain: string;
  motifs: Motif[];
  image: string;
  scenes: TarotScene[];
  closing_line: string;
  disclaimer: string;
  /** 多牌阵分析结果 */
  analysis?: {
    major_arcana_count: number;
    suit_counts: Record<string, number>;
    reversal_count: number;
    element_balance: Record<string, number>;
    relationship_notes: string[];
  };
};
