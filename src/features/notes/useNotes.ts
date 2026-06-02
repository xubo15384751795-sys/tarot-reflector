/**
 * useNotes — 笔记系统 React hook
 *
 * 封装 NotesRepository 的读写操作，提供 React 状态管理。
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ensureNotesRepository, getNotesRepository } from "./repository";
import type {
  ReadingSnapshot,
  ReflectionNote,
} from "./types";

export function useNotes() {
  const [snapshots, setSnapshots] = useState<ReadingSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const initRef = useRef(false);

  // Load on mount (client-only, avoids hydration mismatch)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void ensureNotesRepository().then((hydrated) => {
      setSnapshots(hydrated.listSnapshots());
      setLoaded(true);
    });
  }, []);

  const refresh = useCallback(() => {
    setSnapshots(getNotesRepository().listSnapshots());
  }, []);

  const saveSnapshot = useCallback(
    (snapshot: ReadingSnapshot) => {
      getNotesRepository().saveSnapshot(snapshot);
      refresh();
    },
    [refresh],
  );

  const deleteSnapshot = useCallback(
    (reading_id: string) => {
      getNotesRepository().deleteSnapshot(reading_id);
      refresh();
    },
    [refresh],
  );

  const togglePin = useCallback(
    (reading_id: string) => {
      getNotesRepository().togglePinSnapshot(reading_id);
      refresh();
    },
    [refresh],
  );

  return {
    snapshots,
    loaded,
    repo: getNotesRepository(),
    saveSnapshot,
    deleteSnapshot,
    togglePin,
    refresh,
  };
}

export function useSnapshotDetail(reading_id: string) {
  const [snapshot, setSnapshot] = useState<ReadingSnapshot | null>(null);
  const [notes, setNotes] = useState<ReflectionNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void ensureNotesRepository().then((hydrated) => {
      setSnapshot(hydrated.getSnapshot(reading_id));
      setNotes(hydrated.getNotesForSnapshot(reading_id));
      setLoaded(true);
    });
  }, [reading_id]);

  const refresh = useCallback(() => {
    const repo = getNotesRepository();
    setSnapshot(repo.getSnapshot(reading_id));
    setNotes(repo.getNotesForSnapshot(reading_id));
  }, [reading_id]);

  const saveNote = useCallback(
    (note: ReflectionNote) => {
      getNotesRepository().saveNote(note);
      refresh();
    },
    [refresh],
  );

  const deleteNote = useCallback(
    (note_id: string) => {
      getNotesRepository().deleteNote(note_id);
      refresh();
    },
    [refresh],
  );

  return {
    snapshot,
    notes,
    loaded,
    saveNote,
    deleteNote,
    refresh,
  };
}
