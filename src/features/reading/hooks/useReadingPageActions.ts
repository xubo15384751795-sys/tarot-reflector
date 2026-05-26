"use client";

/**
 * Reading 页面级别的浮层 & 副作用 hook：注记保存、复制分享、视频脚本生成、软关闭。
 *
 * 不属于核心状态机，集中在这里避免污染 reading/page.tsx。
 */

import { useCallback, useState } from "react";
import type { ReadingScript } from "../types/reading";
import type { ReadingScript as VideoReadingScript } from "@/types/readingScript";
import type { ReadingApi } from "./useReadingApi";
import type { SpreadSnapshot } from "../types/reading";
import type { Domain, ReadingMode } from "@/lib/schema";
import { getNotesRepository } from "@/features/notes/repository";
import { createSnapshotFromReading, createNote } from "@/features/notes/utils";
import { checkSameCard } from "@/features/notes/sameCardReminder";
import type { SameCardReminder } from "@/features/notes/sameCardReminder";

type Args = {
  script: ReadingScript | null;
  drawn: SpreadSnapshot | null;
  question: string;
  reframe: string | null;
  domain: Domain;
  mode: ReadingMode;
  api: ReadingApi;
  navigateHome: () => void;
};

export type ReadingPageActions = {
  // UI state
  showNote: boolean;
  showSavePanel: boolean;
  noteSaved: boolean;
  softClose: boolean;
  shareHint: string | null;
  demoMode: boolean;
  videoScript: VideoReadingScript | null;
  sameCardReminder: SameCardReminder | null;
  // setters / handlers
  openNote: () => void;
  closeNote: () => void;
  saveNote: (text: string) => void;
  openSavePanel: () => void;
  closeSavePanel: () => void;
  saveSnapshotWithNote: (noteText: string) => void;
  saveNoteOnly: (noteText: string) => void;
  share: () => Promise<void>;
  triggerDemo: () => Promise<void>;
  closeDemo: () => void;
  startSoftClose: () => void;
  dismissSameCardReminder: () => void;
  checkForSameCard: (cardIds: string[]) => void;
};

export function useReadingPageActions({
  script,
  drawn,
  question,
  reframe,
  domain,
  mode,
  api,
  navigateHome,
}: Args): ReadingPageActions {
  const [showNote, setShowNote] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [softClose, setSoftClose] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoReadingScript | null>(null);
  const [sameCardReminder, setSameCardReminder] = useState<SameCardReminder | null>(null);

  const openNote = useCallback(() => setShowNote(true), []);
  const closeNote = useCallback(() => setShowNote(false), []);
  const openSavePanel = useCallback(() => setShowSavePanel(true), []);
  const closeSavePanel = useCallback(() => setShowSavePanel(false), []);

  const saveNote = useCallback(
    (text: string) => {
      if (!text.trim() || !script || !drawn) {
        setShowNote(false);
        return;
      }
      const repo = getNotesRepository();
      // Check if snapshot already exists
      let snapshot = repo.getSnapshot(drawn.reading_id);
      if (!snapshot) {
        snapshot = createSnapshotFromReading({
          reading_id: drawn.reading_id,
          mode,
          question,
          reframe,
          domain,
          spread_id: drawn.spread_id,
          spread_name_zh: drawn.spread_name_zh,
          drawn_cards: drawn.drawn_cards,
          script,
        });
        repo.saveSnapshot(snapshot);
      }
      const note = createNote({
        snapshot_id: drawn.reading_id,
        content: text.trim(),
        type: "initial",
      });
      repo.saveNote(note);
      setNoteSaved(true);
      setShowNote(false);
      setTimeout(() => setNoteSaved(false), 2400);
    },
    [script, drawn, question, reframe, domain, mode],
  );

  const saveSnapshotWithNote = useCallback(
    (noteText: string) => {
      if (!script || !drawn) {
        setShowSavePanel(false);
        return;
      }
      const repo = getNotesRepository();
      const snapshot = createSnapshotFromReading({
        reading_id: drawn.reading_id,
        mode,
        question,
        reframe,
        domain,
        spread_id: drawn.spread_id,
        spread_name_zh: drawn.spread_name_zh,
        drawn_cards: drawn.drawn_cards,
        script,
      });
      repo.saveSnapshot(snapshot);
      if (noteText.trim()) {
        const note = createNote({
          snapshot_id: drawn.reading_id,
          content: noteText.trim(),
          type: "initial",
        });
        repo.saveNote(note);
      }
      setNoteSaved(true);
      setShowSavePanel(false);
      setTimeout(() => setNoteSaved(false), 2400);
    },
    [script, drawn, question, reframe, domain, mode],
  );

  const saveNoteOnly = useCallback(
    (noteText: string) => {
      if (!noteText.trim() || !script || !drawn) {
        setShowSavePanel(false);
        return;
      }
      const repo = getNotesRepository();
      // Still create a snapshot but don't pin it
      let snapshot = repo.getSnapshot(drawn.reading_id);
      if (!snapshot) {
        snapshot = createSnapshotFromReading({
          reading_id: drawn.reading_id,
          mode,
          question,
          reframe,
          domain,
          spread_id: drawn.spread_id,
          spread_name_zh: drawn.spread_name_zh,
          drawn_cards: drawn.drawn_cards,
          script,
        });
        snapshot.pinned = false;
        snapshot.saved_as_snapshot = false;
        repo.saveSnapshot(snapshot);
      }
      const note = createNote({
        snapshot_id: drawn.reading_id,
        content: noteText.trim(),
        type: "initial",
      });
      repo.saveNote(note);
      setNoteSaved(true);
      setShowSavePanel(false);
      setTimeout(() => setNoteSaved(false), 2400);
    },
    [script, drawn, question, reframe, domain, mode],
  );

  const checkForSameCard = useCallback(
    (cardIds: string[]) => {
      const repo = getNotesRepository();
      const reminder = checkSameCard(repo, cardIds);
      setSameCardReminder(reminder.hasPrevious ? reminder : null);
    },
    [],
  );

  const dismissSameCardReminder = useCallback(() => {
    setSameCardReminder(null);
  }, []);

  const share = useCallback(async () => {
    if (!script) return;
    const lines = [
      script.title,
      script.thesis,
      ...script.scenes.map(
        (s) => `[${s.step_label}] ${s.headline}\n${s.body}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n\n"));
      setShareHint("已复制到剪贴板");
    } catch {
      setShareHint("复制失败");
    }
    setTimeout(() => setShareHint(null), 2200);
  }, [script]);

  const triggerDemo = useCallback(async () => {
    if (!script) return;
    try {
      const vs = await api.generateVideoScript({ script });
      setVideoScript(vs);
      setDemoMode(true);
    } catch {
      setShareHint("演示翻阅出了点小问题");
      setTimeout(() => setShareHint(null), 2500);
    }
  }, [api, script]);

  const closeDemo = useCallback(() => setDemoMode(false), []);

  const startSoftClose = useCallback(() => {
    setSoftClose(true);
    setTimeout(navigateHome, 3500);
  }, [navigateHome]);

  return {
    showNote,
    showSavePanel,
    noteSaved,
    softClose,
    shareHint,
    demoMode,
    videoScript,
    sameCardReminder,
    openNote,
    closeNote,
    saveNote,
    openSavePanel,
    closeSavePanel,
    saveSnapshotWithNote,
    saveNoteOnly,
    share,
    triggerDemo,
    closeDemo,
    startSoftClose,
    dismissSameCardReminder,
    checkForSameCard,
  };
}
