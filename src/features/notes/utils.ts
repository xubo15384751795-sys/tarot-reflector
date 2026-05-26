/**
 * 笔记工具函数
 */

import type { ReadingSnapshot, ReflectionNote } from "./types";
import type { ReadingScript, SpreadSnapshot } from "@/features/reading/types/reading";
import type { Domain, ReadingMode, SpreadId } from "@/lib/schema";

let noteCounter = 0;

export function generateNoteId(): string {
  noteCounter++;
  return `note_${Date.now()}_${noteCounter}`;
}

export function createSnapshotFromReading(opts: {
  reading_id: string;
  mode: ReadingMode;
  question: string;
  reframe: string | null;
  domain: Domain;
  spread_id: SpreadId;
  spread_name_zh: string;
  drawn_cards: SpreadSnapshot["drawn_cards"];
  script: ReadingScript;
}): ReadingSnapshot {
  return {
    reading_id: opts.reading_id,
    created_at: new Date().toISOString(),
    mode: opts.mode,
    question_original: opts.question,
    question_reframed: opts.reframe,
    domain: opts.domain,
    spread_id: opts.spread_id,
    spread_name_zh: opts.spread_name_zh,
    drawn_cards: opts.drawn_cards,
    script: opts.script,
    summary_zh: opts.script.thesis ?? "",
    closing_line_zh: opts.script.closing_line ?? "",
    pinned: true,
    saved_as_snapshot: true,
    source: {
      rulesVersion: "v1",
      deckVersion: "v1",
      aiProvider: process.env.AI_PROVIDER ?? "template",
      model: process.env.DEEPSEEK_MODEL ?? process.env.OPENAI_MODEL ?? "local",
    },
  };
}

export function createNote(opts: {
  snapshot_id: string;
  content: string;
  type: ReflectionNote["type"];
  mood_tags?: string[];
  user_tags?: string[];
}): ReflectionNote {
  const now = new Date().toISOString();
  return {
    note_id: generateNoteId(),
    snapshot_id: opts.snapshot_id,
    created_at: now,
    updated_at: now,
    content: opts.content,
    type: opts.type,
    mood_tags: opts.mood_tags ?? [],
    user_tags: opts.user_tags ?? [],
    pinned: false,
  };
}

export function formatRelativeTime(iso: string): { full: string; relative: string } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);

  const full = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  let relative: string;
  if (diffMins < 1) relative = "刚刚";
  else if (diffMins < 60) relative = `${diffMins} 分钟前`;
  else if (diffHours < 24) relative = `${diffHours} 小时前`;
  else if (diffDays < 7) relative = `${diffDays} 天前`;
  else if (diffDays < 30) relative = `${Math.floor(diffDays / 7)} 周前`;
  else if (diffDays < 365) relative = `${Math.floor(diffDays / 30)} 个月前`;
  else relative = `${Math.floor(diffDays / 365)} 年前`;

  return { full, relative };
}

export function getModeLabel(mode: ReadingMode): string {
  switch (mode) {
    case "daily": return "今日一牌";
    case "question": return "问题解读";
    case "deep": return "深度牌阵";
    default: return mode;
  }
}
