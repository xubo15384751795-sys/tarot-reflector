// @vitest-environment jsdom
/**
 * Notes Repository 测试
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ReadingSnapshot, ReflectionNote, NotesRepository } from "@/features/notes/types";

// Mock localStorage
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

function makeSnapshot(overrides: Partial<ReadingSnapshot> = {}): ReadingSnapshot {
  return {
    reading_id: "r_test_1",
    created_at: new Date().toISOString(),
    mode: "question",
    question_original: "我应该换工作吗？",
    question_reframed: "现在的 工作让你最在意的是什么？",
    domain: "career",
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    drawn_cards: [{
      position_index: 0,
      position_name_zh: "整体",
      card_id: "the_fool",
      card_name_zh: "愚者",
      card_name_en: "The Fool",
      orientation: "upright",
      orientation_zh: "正位",
      image: "/cards/major/the_fool.jpg",
    }],
    script: {
      title: "新的开始",
      thesis: "这是一段足够长的中文开场陈述。",
      spread_id: "single_card",
      spread_name_zh: "单牌解读",
      cards: [],
      card_id: "the_fool",
      card_name: "The Fool",
      zh_name: "愚者",
      orientation: "upright",
      domain: "career",
      motifs: [],
      image: "/cards/major/the_fool.jpg",
      scenes: [],
      closing_line: "档案翻到这里。",
      disclaimer: "这不是命运预测。",
    },
    summary_zh: "愚者代表新的开始。",
    closing_line_zh: "档案翻到这里。",
    pinned: true,
    saved_as_snapshot: true,
    source: { rulesVersion: "v1", deckVersion: "v1", aiProvider: "template", model: "local" },
    ...overrides,
  };
}

function makeNote(overrides: Partial<ReflectionNote> = {}): ReflectionNote {
  const now = new Date().toISOString();
  return {
    note_id: "note_1",
    snapshot_id: "r_test_1",
    created_at: now,
    updated_at: now,
    content: "这张牌让我想到了新的可能性。",
    type: "initial",
    mood_tags: [],
    user_tags: [],
    pinned: false,
    ...overrides,
  };
}

describe("NotesRepository", () => {
  let repo: NotesRepository;

  beforeEach(async () => {
    storage.clear();
    vi.resetModules();
    const mod = await import("@/features/notes/repository");
    repo = mod.createLocalNotesRepository();
  });

  describe("saveSnapshot / getSnapshot", () => {
    it("保存并读取快照", () => {
      const snap = makeSnapshot();
      repo.saveSnapshot(snap);
      const got = repo.getSnapshot("r_test_1");
      expect(got).toBeDefined();
      expect(got?.reading_id).toBe("r_test_1");
      expect(got?.question_original).toBe("我应该换工作吗？");
    });

    it("覆盖同 ID 快照", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveSnapshot(makeSnapshot({ summary_zh: "更新后的摘要" }));
      const got = repo.getSnapshot("r_test_1");
      expect(got?.summary_zh).toBe("更新后的摘要");
    });

    it("不存在的 ID 返回 null", () => {
      expect(repo.getSnapshot("nonexistent")).toBeNull();
    });
  });

  describe("listSnapshots", () => {
    it("返回所有快照", () => {
      repo.saveSnapshot(makeSnapshot({ reading_id: "r1" }));
      repo.saveSnapshot(makeSnapshot({ reading_id: "r2" }));
      expect(repo.listSnapshots()).toHaveLength(2);
    });

    it("按模式过滤", () => {
      repo.saveSnapshot(makeSnapshot({ reading_id: "r1", mode: "daily" }));
      repo.saveSnapshot(makeSnapshot({ reading_id: "r2", mode: "question" }));
      expect(repo.listSnapshots({ mode: "daily" })).toHaveLength(1);
    });

    it("按牌过滤", () => {
      repo.saveSnapshot(makeSnapshot({ reading_id: "r1" }));
      repo.saveSnapshot(makeSnapshot({
        reading_id: "r2",
        drawn_cards: [{
          position_index: 0,
          position_name_zh: "整体",
          card_id: "the_star",
          card_name_zh: "星星",
          card_name_en: "The Star",
          orientation: "upright",
          orientation_zh: "正位",
          image: "/cards/major/the_star.jpg",
        }],
      }));
      expect(repo.listSnapshots({ card_id: "the_fool" })).toHaveLength(1);
    });

    it("只看固定", () => {
      repo.saveSnapshot(makeSnapshot({ reading_id: "r1", pinned: true }));
      repo.saveSnapshot(makeSnapshot({ reading_id: "r2", pinned: false }));
      expect(repo.listSnapshots({ pinned_only: true })).toHaveLength(1);
    });
  });

  describe("deleteSnapshot", () => {
    it("删除快照及关联笔记", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveNote(makeNote());
      repo.deleteSnapshot("r_test_1");
      expect(repo.getSnapshot("r_test_1")).toBeNull();
      expect(repo.getNotesForSnapshot("r_test_1")).toHaveLength(0);
    });
  });

  describe("togglePinSnapshot", () => {
    it("切换固定状态", () => {
      repo.saveSnapshot(makeSnapshot({ pinned: true }));
      repo.togglePinSnapshot("r_test_1");
      expect(repo.getSnapshot("r_test_1")?.pinned).toBe(false);
      repo.togglePinSnapshot("r_test_1");
      expect(repo.getSnapshot("r_test_1")?.pinned).toBe(true);
    });
  });

  describe("saveNote / getNotesForSnapshot", () => {
    it("保存并读取笔记", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveNote(makeNote());
      const notes = repo.getNotesForSnapshot("r_test_1");
      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe("这张牌让我想到了新的可能性。");
    });

    it("支持 follow_up 笔记", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveNote(makeNote({ note_id: "n1", type: "initial" }));
      repo.saveNote(makeNote({ note_id: "n2", type: "follow_up", content: "后来我想了想…" }));
      const notes = repo.getNotesForSnapshot("r_test_1");
      expect(notes).toHaveLength(2);
    });

    it("覆盖同 ID 笔记", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveNote(makeNote());
      repo.saveNote(makeNote({ content: "更新后的内容" }));
      const notes = repo.getNotesForSnapshot("r_test_1");
      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe("更新后的内容");
    });
  });

  describe("deleteNote", () => {
    it("删除单条笔记", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveNote(makeNote({ note_id: "n1" }));
      repo.saveNote(makeNote({ note_id: "n2", content: "第二条" }));
      repo.deleteNote("n1");
      expect(repo.getNotesForSnapshot("r_test_1")).toHaveLength(1);
    });
  });

  describe("updateNote", () => {
    it("更新笔记内容", () => {
      repo.saveSnapshot(makeSnapshot());
      repo.saveNote(makeNote());
      repo.updateNote("note_1", "更新后的感受");
      expect(repo.getNote("note_1")?.content).toBe("更新后的感受");
    });
  });

  describe("hasCardBeenSaved", () => {
    it("已保存的牌返回 true", () => {
      repo.saveSnapshot(makeSnapshot());
      expect(repo.hasCardBeenSaved("the_fool")).toBe(true);
      expect(repo.hasCardBeenSaved("the_star")).toBe(false);
    });
  });

  describe("getSnapshotsForCard", () => {
    it("返回包含指定牌的所有快照", () => {
      repo.saveSnapshot(makeSnapshot({ reading_id: "r1" }));
      repo.saveSnapshot(makeSnapshot({ reading_id: "r2" }));
      repo.saveSnapshot(makeSnapshot({
        reading_id: "r3",
        drawn_cards: [{
          position_index: 0,
          position_name_zh: "整体",
          card_id: "the_star",
          card_name_zh: "星星",
          card_name_en: "The Star",
          orientation: "upright",
          orientation_zh: "正位",
          image: "/cards/major/the_star.jpg",
        }],
      }));
      expect(repo.getSnapshotsForCard("the_fool")).toHaveLength(2);
    });
  });
});
