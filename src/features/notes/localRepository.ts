/**
 * LocalNotesRepository — 基于 localStorage 的笔记存储
 *
 * 用于 SSR fallback、单元测试、Dexie 迁移源。
 */

import type {
  NotesRepository,
  ReadingSnapshot,
  ReflectionNote,
  SnapshotFilter,
} from "./types";

export const SNAPSHOTS_KEY = "tarot:snapshots";
export const NOTES_KEY = "tarot:reflection_notes";

function loadArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArray<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* silent */
  }
}

export function createLocalNotesRepository(): NotesRepository {
  return {
    saveSnapshot(snapshot: ReadingSnapshot): void {
      const all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      const existing = all.findIndex((s) => s.reading_id === snapshot.reading_id);
      if (existing >= 0) {
        all[existing] = snapshot;
      } else {
        all.unshift(snapshot);
      }
      saveArray(SNAPSHOTS_KEY, all);
    },

    getSnapshot(reading_id: string): ReadingSnapshot | null {
      const all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      return all.find((s) => s.reading_id === reading_id) ?? null;
    },

    listSnapshots(filter?: SnapshotFilter): ReadingSnapshot[] {
      let all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      if (filter?.mode) all = all.filter((s) => s.mode === filter.mode);
      if (filter?.card_id) all = all.filter((s) => s.drawn_cards.some((c) => c.card_id === filter.card_id));
      if (filter?.pinned_only) all = all.filter((s) => s.pinned);
      if (filter?.domain) all = all.filter((s) => s.domain === filter.domain);
      return all;
    },

    deleteSnapshot(reading_id: string): void {
      const all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      saveArray(
        SNAPSHOTS_KEY,
        all.filter((s) => s.reading_id !== reading_id),
      );
      const notes = loadArray<ReflectionNote>(NOTES_KEY);
      saveArray(
        NOTES_KEY,
        notes.filter((n) => n.snapshot_id !== reading_id),
      );
    },

    togglePinSnapshot(reading_id: string): void {
      const all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      const snap = all.find((s) => s.reading_id === reading_id);
      if (snap) {
        snap.pinned = !snap.pinned;
        saveArray(SNAPSHOTS_KEY, all);
      }
    },

    saveNote(note: ReflectionNote): void {
      const all = loadArray<ReflectionNote>(NOTES_KEY);
      const existing = all.findIndex((n) => n.note_id === note.note_id);
      if (existing >= 0) {
        all[existing] = note;
      } else {
        all.unshift(note);
      }
      saveArray(NOTES_KEY, all);
    },

    getNote(note_id: string): ReflectionNote | null {
      const all = loadArray<ReflectionNote>(NOTES_KEY);
      return all.find((n) => n.note_id === note_id) ?? null;
    },

    getNotesForSnapshot(snapshot_id: string): ReflectionNote[] {
      const all = loadArray<ReflectionNote>(NOTES_KEY);
      return all
        .filter((n) => n.snapshot_id === snapshot_id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },

    getAllNotes(): ReflectionNote[] {
      return loadArray<ReflectionNote>(NOTES_KEY);
    },

    deleteNote(note_id: string): void {
      const all = loadArray<ReflectionNote>(NOTES_KEY);
      saveArray(
        NOTES_KEY,
        all.filter((n) => n.note_id !== note_id),
      );
    },

    updateNote(note_id: string, content: string): void {
      const all = loadArray<ReflectionNote>(NOTES_KEY);
      const note = all.find((n) => n.note_id === note_id);
      if (note) {
        note.content = content;
        note.updated_at = new Date().toISOString();
        saveArray(NOTES_KEY, all);
      }
    },

    hasCardBeenSaved(card_id: string): boolean {
      const all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      return all.some((s) => s.drawn_cards.some((c) => c.card_id === card_id));
    },

    getSnapshotsForCard(card_id: string): ReadingSnapshot[] {
      const all = loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
      return all.filter((s) => s.drawn_cards.some((c) => c.card_id === card_id));
    },

    getSnapshotCount(): number {
      return loadArray<ReadingSnapshot>(SNAPSHOTS_KEY).length;
    },

    getNoteCount(): number {
      return loadArray<ReflectionNote>(NOTES_KEY).length;
    },
  };
}

export function loadLocalSnapshots(): ReadingSnapshot[] {
  return loadArray<ReadingSnapshot>(SNAPSHOTS_KEY);
}

export function loadLocalNotes(): ReflectionNote[] {
  return loadArray<ReflectionNote>(NOTES_KEY);
}
