import Dexie, { type Table } from "dexie";
import type { ReadingSnapshot, ReflectionNote } from "./types";

export class NotesDatabase extends Dexie {
  snapshots!: Table<ReadingSnapshot, string>;
  notes!: Table<ReflectionNote, string>;

  constructor() {
    super("tarot-reflector-notes");
    this.version(1).stores({
      snapshots: "reading_id, created_at, mode, domain, pinned",
      notes: "note_id, snapshot_id, created_at, pinned",
    });
  }
}

let _db: NotesDatabase | null = null;

export function getNotesDb(): NotesDatabase {
  if (!_db) _db = new NotesDatabase();
  return _db;
}
