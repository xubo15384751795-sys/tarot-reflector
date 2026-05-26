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

type Args = {
  script: ReadingScript | null;
  question: string;
  api: ReadingApi;
  navigateHome: () => void;
};

export type ReadingPageActions = {
  // UI state
  showNote: boolean;
  noteSaved: boolean;
  softClose: boolean;
  shareHint: string | null;
  demoMode: boolean;
  videoScript: VideoReadingScript | null;
  // setters / handlers
  openNote: () => void;
  closeNote: () => void;
  saveNote: (text: string) => void;
  share: () => Promise<void>;
  triggerDemo: () => Promise<void>;
  closeDemo: () => void;
  startSoftClose: () => void;
};

export function useReadingPageActions({
  script,
  question,
  api,
  navigateHome,
}: Args): ReadingPageActions {
  const [showNote, setShowNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [softClose, setSoftClose] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoReadingScript | null>(null);

  const openNote = useCallback(() => setShowNote(true), []);
  const closeNote = useCallback(() => setShowNote(false), []);

  const saveNote = useCallback(
    (text: string) => {
      if (!text.trim() || !script) {
        setShowNote(false);
        return;
      }
      try {
        const key = "tarot:notes";
        const existing = JSON.parse(
          localStorage.getItem(key) ?? "[]",
        ) as Array<unknown>;
        existing.unshift({
          savedAt: new Date().toISOString(),
          card_id: script.card_id,
          zh_name: script.zh_name,
          orientation: script.orientation,
          question,
          note: text.trim(),
        });
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      } catch {
        /* silent */
      }
      setNoteSaved(true);
      setShowNote(false);
      setTimeout(() => setNoteSaved(false), 2400);
    },
    [script, question],
  );

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
    noteSaved,
    softClose,
    shareHint,
    demoMode,
    videoScript,
    openNote,
    closeNote,
    saveNote,
    share,
    triggerDemo,
    closeDemo,
    startSoftClose,
  };
}
