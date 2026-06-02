// @vitest-environment jsdom
/**
 * Same Card Reminder 测试
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { checkSameCard } from "@/features/notes/sameCardReminder";
import type { ReadingSnapshot } from "@/features/notes/types";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
    clear: () => { storage.clear(); },
    get length() { return storage.size; },
    key: (index: number) => [...storage.keys()][index] ?? null,
  },
  writable: true,
});

function makeSnapshot(cardId: string, readingId: string): ReadingSnapshot {
  return {
    reading_id: readingId,
    created_at: new Date().toISOString(),
    mode: "question",
    question_original: "测试问题",
    question_reframed: null,
    domain: "self",
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    drawn_cards: [{
      position_index: 0,
      position_name_zh: "整体",
      card_id: cardId,
      card_name_zh: "愚者",
      card_name_en: "The Fool",
      orientation: "upright",
      orientation_zh: "正位",
      image: `/cards/major/${cardId}.jpg`,
    }],
    script: {} as ReadingSnapshot["script"],
    summary_zh: "",
    closing_line_zh: "",
    pinned: true,
    saved_as_snapshot: true,
    source: { rulesVersion: "v1", deckVersion: "v1", aiProvider: "template", model: "local" },
  };
}

describe("checkSameCard", () => {
  beforeEach(() => {
    storage.clear();
    vi.resetModules();
  });

  it("无历史记录时返回 hasPrevious=false", async () => {
    const { createLocalNotesRepository } = await import("@/features/notes/localRepository");
    const repo = createLocalNotesRepository();
    const result = checkSameCard(repo, ["the_fool"]);
    expect(result.hasPrevious).toBe(false);
    expect(result.snapshots).toHaveLength(0);
  });

  it("有历史记录时返回匹配快照", async () => {
    const { createLocalNotesRepository } = await import("@/features/notes/localRepository");
    const repo = createLocalNotesRepository();
    repo.saveSnapshot(makeSnapshot("the_fool", "r1"));
    const result = checkSameCard(repo, ["the_fool"]);
    expect(result.hasPrevious).toBe(true);
    expect(result.snapshots).toHaveLength(1);
    expect(result.message).toContain("曾经出现");
  });

  it("多条记录时消息包含次数", async () => {
    const { createLocalNotesRepository } = await import("@/features/notes/localRepository");
    const repo = createLocalNotesRepository();
    repo.saveSnapshot(makeSnapshot("the_fool", "r1"));
    repo.saveSnapshot(makeSnapshot("the_fool", "r2"));
    const result = checkSameCard(repo, ["the_fool"]);
    expect(result.hasPrevious).toBe(true);
    expect(result.snapshots).toHaveLength(2);
    expect(result.message).toContain("2 次");
  });

  it("不匹配的牌返回 false", async () => {
    const { createLocalNotesRepository } = await import("@/features/notes/localRepository");
    const repo = createLocalNotesRepository();
    repo.saveSnapshot(makeSnapshot("the_fool", "r1"));
    const result = checkSameCard(repo, ["the_star"]);
    expect(result.hasPrevious).toBe(false);
  });
});
