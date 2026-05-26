/**
 * 笔记系统数据模型
 *
 * ReadingSnapshot: 解读快照（牌面 + 问题 + 解读 + 元数据）
 * ReflectionNote: 用户反思笔记（支持时间线式追加）
 * NotesRepository: 存储接口（方便未来换 IndexedDB / 数据库）
 */

import type { Domain, ReadingMode, SpreadId } from "@/lib/schema";
import type { ReadingScript, DrawnCardSnapshot } from "@/features/reading/types/reading";

// ─── Reading Snapshot ─────────────────────────────

export type ReadingSnapshotSource = {
  rulesVersion: string;
  deckVersion: string;
  aiProvider: string;
  model: string;
};

export type ReadingSnapshot = {
  reading_id: string;
  created_at: string;
  mode: ReadingMode;
  question_original: string;
  question_reframed: string | null;
  domain: Domain;
  spread_id: SpreadId;
  spread_name_zh: string;
  drawn_cards: DrawnCardSnapshot[];
  script: ReadingScript;
  summary_zh: string;
  closing_line_zh: string;
  pinned: boolean;
  saved_as_snapshot: boolean;
  source: ReadingSnapshotSource;
};

// ─── Reflection Note ──────────────────────────────

export type ReflectionNoteType = "initial" | "follow_up" | "review";

export type ReflectionNote = {
  note_id: string;
  snapshot_id: string;
  created_at: string;
  updated_at: string;
  content: string;
  type: ReflectionNoteType;
  mood_tags: string[];
  user_tags: string[];
  pinned: boolean;
};

// ─── Review Prompt ────────────────────────────────

export type ReviewPrompt = {
  id: string;
  prompt_zh: string;
  category: "revisit" | "growth" | "pattern";
};

export const REVIEW_PROMPTS: ReviewPrompt[] = [
  { id: "revisit_1", prompt_zh: "现在再看这次牌面，你的感受有变化吗？", category: "revisit" },
  { id: "revisit_2", prompt_zh: "当时写下的这句话，现在还像你吗？", category: "revisit" },
  { id: "growth_1", prompt_zh: "从那次到现在，你做了什么不一样的事？", category: "growth" },
  { id: "growth_2", prompt_zh: "如果现在的你给当时的自己一句话，会是什么？", category: "growth" },
  { id: "pattern_1", prompt_zh: "这张牌反复出现过吗？那时候你在想什么？", category: "pattern" },
];

// ─── Repository Interface ─────────────────────────

export type SnapshotFilter = {
  mode?: ReadingMode;
  card_id?: string;
  pinned_only?: boolean;
  domain?: Domain;
};

export interface NotesRepository {
  // Snapshots
  saveSnapshot(snapshot: ReadingSnapshot): void;
  getSnapshot(reading_id: string): ReadingSnapshot | null;
  listSnapshots(filter?: SnapshotFilter): ReadingSnapshot[];
  deleteSnapshot(reading_id: string): void;
  togglePinSnapshot(reading_id: string): void;

  // Notes
  saveNote(note: ReflectionNote): void;
  getNote(note_id: string): ReflectionNote | null;
  getNotesForSnapshot(snapshot_id: string): ReflectionNote[];
  getAllNotes(): ReflectionNote[];
  deleteNote(note_id: string): void;
  updateNote(note_id: string, content: string): void;

  // Queries
  hasCardBeenSaved(card_id: string): boolean;
  getSnapshotsForCard(card_id: string): ReadingSnapshot[];
  getSnapshotCount(): number;
  getNoteCount(): number;
}
