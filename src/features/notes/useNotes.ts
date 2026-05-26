/**
 * useNotes — 笔记系统 React hook
 *
 * 封装 NotesRepository 的读写操作，提供 React 状态管理。
 */

"use client";

import { useCallback, useState } from "react";
import { getNotesRepository } from "./repository";
import type {
  ReadingSnapshot,
  ReflectionNote,
} from "./types";

export function useNotes() {
  const repo = getNotesRepository();
  const [snapshots, setSnapshots] = useState<ReadingSnapshot[]>(() => repo.listSnapshots());

  const refresh = useCallback(() => {
    setSnapshots(repo.listSnapshots());
  }, [repo]);

  const saveSnapshot = useCallback(
    (snapshot: ReadingSnapshot) => {
      repo.saveSnapshot(snapshot);
      refresh();
    },
    [repo, refresh],
  );

  const deleteSnapshot = useCallback(
    (reading_id: string) => {
      repo.deleteSnapshot(reading_id);
      refresh();
    },
    [repo, refresh],
  );

  const togglePin = useCallback(
    (reading_id: string) => {
      repo.togglePinSnapshot(reading_id);
      refresh();
    },
    [repo, refresh],
  );

  return {
    snapshots,
    loaded: true,
    repo,
    saveSnapshot,
    deleteSnapshot,
    togglePin,
    refresh,
  };
}

export function useSnapshotDetail(reading_id: string) {
  const repo = getNotesRepository();
  const [snapshot, setSnapshot] = useState<ReadingSnapshot | null>(() => repo.getSnapshot(reading_id));
  const [notes, setNotes] = useState<ReflectionNote[]>(() => repo.getNotesForSnapshot(reading_id));

  const refresh = useCallback(() => {
    setSnapshot(repo.getSnapshot(reading_id));
    setNotes(repo.getNotesForSnapshot(reading_id));
  }, [repo, reading_id]);

  const saveNote = useCallback(
    (note: ReflectionNote) => {
      repo.saveNote(note);
      refresh();
    },
    [repo, refresh],
  );

  const deleteNote = useCallback(
    (note_id: string) => {
      repo.deleteNote(note_id);
      refresh();
    },
    [repo, refresh],
  );

  return {
    snapshot,
    notes,
    loaded: true,
    saveNote,
    deleteNote,
    refresh,
  };
}
