/**
 * useNotes — 笔记系统 React hook
 *
 * 封装 NotesRepository 的读写操作，提供 React 状态管理。
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getNotesRepository } from "./repository";
import type {
  ReadingSnapshot,
  ReflectionNote,
} from "./types";

export function useNotes() {
  const repo = getNotesRepository();
  const [snapshots, setSnapshots] = useState<ReadingSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const initRef = useRef(false);

  // Load on mount (client-only, avoids hydration mismatch)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setSnapshots(repo.listSnapshots());
    setLoaded(true);
     
  }, [repo]);

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
    loaded,
    repo,
    saveSnapshot,
    deleteSnapshot,
    togglePin,
    refresh,
  };
}

export function useSnapshotDetail(reading_id: string) {
  const repo = getNotesRepository();
  const [snapshot, setSnapshot] = useState<ReadingSnapshot | null>(null);
  const [notes, setNotes] = useState<ReflectionNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setSnapshot(repo.getSnapshot(reading_id));
    setNotes(repo.getNotesForSnapshot(reading_id));
    setLoaded(true);
     
  }, [repo, reading_id]);

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
    loaded,
    saveNote,
    deleteNote,
    refresh,
  };
}
