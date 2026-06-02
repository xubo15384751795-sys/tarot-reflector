/**
 * DexieNotesRepository — IndexedDB 笔记存储
 *
 * 内存镜像 + write-through，对外保持同步 NotesRepository 接口。
 * 首次打开时从 localStorage 迁移历史数据。
 */

import type {
  NotesRepository,
  ReadingSnapshot,
  ReflectionNote,
  SnapshotFilter,
} from "./types";
import { getNotesDb } from "./db";
import {
  loadLocalSnapshots,
  loadLocalNotes,
  NOTES_KEY,
  SNAPSHOTS_KEY,
} from "./localRepository";

const MIGRATION_FLAG = "tarot:dexie_migrated_v1";

function persistSnapshot(snapshot: ReadingSnapshot): void {
  void getNotesDb().snapshots.put(snapshot);
}

function persistNote(note: ReflectionNote): void {
  void getNotesDb().notes.put(note);
}

function removeSnapshot(reading_id: string): void {
  void getNotesDb().snapshots.delete(reading_id);
}

function removeNote(note_id: string): void {
  void getNotesDb().notes.delete(note_id);
}

async function migrateFromLocalStorage(): Promise<{
  snapshots: ReadingSnapshot[];
  notes: ReflectionNote[];
}> {
  const db = getNotesDb();
  const existingCount = await db.snapshots.count();
  if (existingCount > 0) {
    return {
      snapshots: await db.snapshots.orderBy("created_at").reverse().toArray(),
      notes: await db.notes.toArray(),
    };
  }

  const localSnapshots = loadLocalSnapshots();
  const localNotes = loadLocalNotes();

  if (localSnapshots.length > 0 || localNotes.length > 0) {
    await db.transaction("rw", db.snapshots, db.notes, async () => {
      await db.snapshots.bulkPut(localSnapshots);
      await db.notes.bulkPut(localNotes);
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(MIGRATION_FLAG, "1");
    }
  }

  return {
    snapshots: localSnapshots,
    notes: localNotes,
  };
}

export async function createDexieNotesRepository(): Promise<NotesRepository> {
  const { snapshots: initialSnapshots, notes: initialNotes } =
    await migrateFromLocalStorage();

  let snapshots = [...initialSnapshots].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  let notes = [...initialNotes];

  const repo: NotesRepository = {
    saveSnapshot(snapshot: ReadingSnapshot): void {
      const idx = snapshots.findIndex((s) => s.reading_id === snapshot.reading_id);
      if (idx >= 0) {
        snapshots[idx] = snapshot;
      } else {
        snapshots.unshift(snapshot);
      }
      persistSnapshot(snapshot);
    },

    getSnapshot(reading_id: string): ReadingSnapshot | null {
      return snapshots.find((s) => s.reading_id === reading_id) ?? null;
    },

    listSnapshots(filter?: SnapshotFilter): ReadingSnapshot[] {
      let result = snapshots;
      if (filter?.mode) result = result.filter((s) => s.mode === filter.mode);
      if (filter?.card_id) {
        result = result.filter((s) =>
          s.drawn_cards.some((c) => c.card_id === filter.card_id),
        );
      }
      if (filter?.pinned_only) result = result.filter((s) => s.pinned);
      if (filter?.domain) result = result.filter((s) => s.domain === filter.domain);
      return result;
    },

    deleteSnapshot(reading_id: string): void {
      const notesToDelete = notes.filter((n) => n.snapshot_id === reading_id);
      snapshots = snapshots.filter((s) => s.reading_id !== reading_id);
      notes = notes.filter((n) => n.snapshot_id !== reading_id);
      removeSnapshot(reading_id);
      for (const note of notesToDelete) {
        removeNote(note.note_id);
      }
    },

    togglePinSnapshot(reading_id: string): void {
      const snap = snapshots.find((s) => s.reading_id === reading_id);
      if (snap) {
        snap.pinned = !snap.pinned;
        persistSnapshot(snap);
      }
    },

    saveNote(note: ReflectionNote): void {
      const idx = notes.findIndex((n) => n.note_id === note.note_id);
      if (idx >= 0) {
        notes[idx] = note;
      } else {
        notes.unshift(note);
      }
      persistNote(note);
    },

    getNote(note_id: string): ReflectionNote | null {
      return notes.find((n) => n.note_id === note_id) ?? null;
    },

    getNotesForSnapshot(snapshot_id: string): ReflectionNote[] {
      return notes
        .filter((n) => n.snapshot_id === snapshot_id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
    },

    getAllNotes(): ReflectionNote[] {
      return notes;
    },

    deleteNote(note_id: string): void {
      notes = notes.filter((n) => n.note_id !== note_id);
      removeNote(note_id);
    },

    updateNote(note_id: string, content: string): void {
      const note = notes.find((n) => n.note_id === note_id);
      if (note) {
        note.content = content;
        note.updated_at = new Date().toISOString();
        persistNote(note);
      }
    },

    hasCardBeenSaved(card_id: string): boolean {
      return snapshots.some((s) =>
        s.drawn_cards.some((c) => c.card_id === card_id),
      );
    },

    getSnapshotsForCard(card_id: string): ReadingSnapshot[] {
      return snapshots.filter((s) =>
        s.drawn_cards.some((c) => c.card_id === card_id),
      );
    },

    getSnapshotCount(): number {
      return snapshots.length;
    },

    getNoteCount(): number {
      return notes.length;
    },
  };

  return repo;
}

/** 清除 localStorage 遗留键（迁移完成后可选调用） */
export function clearLegacyLocalStorage(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_FLAG) === "1") {
    localStorage.removeItem(SNAPSHOTS_KEY);
    localStorage.removeItem(NOTES_KEY);
  }
}
