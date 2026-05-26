"use client";

/**
 * DemoModePlayer — 解读短片播放器
 *
 * 视觉对齐主站：
 *   - 舞台外圈用 archive frame（金线 + 四角纹饰 + 落地阴影）
 *   - 控件全部用 .archive-link 玻璃药丸
 *   - 进度条暖金 + 玻璃底
 *   - 字幕用新的衬线玻璃条
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReadingScript, DemoPlayerState } from "@/types/readingScript";
import VideoSceneRenderer from "./VideoSceneRenderer";
import VideoSubtitle from "./VideoSubtitle";
import VideoProgressBar from "./VideoProgressBar";

type SceneCard = {
  card_id: string;
  zh_name: string;
  image: string;
  orientation: "upright" | "reversed";
};

type Props = {
  script: ReadingScript;
  /** 真实牌图来源 —— VideoSceneRenderer 用它按 card_id 查图 */
  cards?: SceneCard[];
  onComplete?: () => void;
  autoPlay?: boolean;
};

export default function DemoModePlayer({
  script,
  cards,
  onComplete,
  autoPlay = true,
}: Props) {
  const [state, setState] = useState<DemoPlayerState>({
    currentScene: 0,
    isPlaying: autoPlay,
    elapsed: 0,
    showSubtitles: true,
    showVoiceover: false,
  });
  // 用 state 驱动平滑进度（在 effect 里 setInterval tick），避免 render 中读 ref
  const [smoothElapsed, setSmoothElapsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScene = script.scenes[state.currentScene];
  const isLastScene = state.currentScene === script.scenes.length - 1;

  // 场景切换计时
  useEffect(() => {
    if (!state.isPlaying || !currentScene) return;
    const duration = currentScene.duration * 1000;
    timerRef.current = setTimeout(() => {
      if (isLastScene) {
        setState((s) => ({ ...s, isPlaying: false }));
        onComplete?.();
      } else {
        setState((s) => ({
          ...s,
          currentScene: s.currentScene + 1,
          elapsed: s.elapsed + currentScene.duration,
        }));
      }
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.isPlaying, state.currentScene, currentScene, isLastScene, onComplete]);

  // 进度条平滑：每 200ms 把 smoothElapsed 推一下，
  // 暂停时停住在 state.elapsed。
  useEffect(() => {
    if (!state.isPlaying) {
      // 一次性把进度条 lock 在 state.elapsed；
      // 不会引发 cascading renders（依赖项里没有 smoothElapsed）。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSmoothElapsed(state.elapsed);
      return;
    }
    const sceneStart = Date.now();
    const tick = setInterval(() => {
      setSmoothElapsed(state.elapsed + (Date.now() - sceneStart) / 1000);
    }, 200);
    return () => clearInterval(tick);
  }, [state.isPlaying, state.elapsed]);

  const handlePlayPause = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
  }, []);
  const handlePrev = useCallback(() => {
    setState((s) => ({ ...s, currentScene: Math.max(0, s.currentScene - 1) }));
  }, []);
  const handleNext = useCallback(() => {
    setState((s) => ({
      ...s,
      currentScene: Math.min(script.scenes.length - 1, s.currentScene + 1),
    }));
  }, [script.scenes.length]);
  const handleRestart = useCallback(() => {
    setState((s) => ({ ...s, currentScene: 0, isPlaying: true, elapsed: 0 }));
  }, []);

  if (!currentScene) return null;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* ─── 舞台：archive 金线外框 + 四角纹饰 ─── */}
      <div className="relative" style={{ width: "min(100%, 320px)" }}>
        {/* 暖金 halo 落在舞台后面 */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: "-8%",
            borderRadius: 28,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(214,178,109,0.18) 0%, rgba(214,178,109,0.04) 50%, transparent 75%)",
            filter: "blur(22px)",
          }}
        />
        <div
          className="relative aspect-[9/16] rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(214,178,109,0.32)",
            background: "var(--bg-base)",
            boxShadow:
              "inset 0 1px 0 rgba(255,247,225,0.08), 0 24px 56px rgba(0,0,0,0.55)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.scene_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <VideoSceneRenderer scene={currentScene} script={script} cards={cards} />
            </motion.div>
          </AnimatePresence>

          {/* 字幕 */}
          {state.showSubtitles && <VideoSubtitle text={currentScene.subtitle_zh} />}

          {/* 点舞台任意处 = 暂停/播放 */}
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 z-10"
            aria-label={state.isPlaying ? "暂停" : "播放"}
          />
        </div>
      </div>

      {/* ─── 进度条 ─── */}
      <VideoProgressBar
        currentScene={state.currentScene}
        totalScenes={script.scenes.length}
        elapsed={smoothElapsed}
        totalDuration={script.total_duration}
      />

      {/* ─── 玻璃控件 ─── */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={state.currentScene === 0}
          className="archive-link"
          style={{
            padding: "8px 12px",
            opacity: state.currentScene === 0 ? 0.35 : 1,
            cursor: state.currentScene === 0 ? "not-allowed" : "pointer",
          }}
          aria-label="上一幕"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="14,6 8,12 14,18" />
          </svg>
        </button>

        <button
          onClick={handlePlayPause}
          className="hero-cta"
          style={{ padding: "10px 22px" }}
          aria-label={state.isPlaying ? "暂停" : "播放"}
        >
          {state.isPlaying ? (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
          <span className="ml-2 text-[12.5px] tracking-[0.08em]">
            {state.isPlaying ? "暂停" : "播放"}
          </span>
        </button>

        <button
          onClick={handleNext}
          disabled={isLastScene}
          className="archive-link"
          style={{
            padding: "8px 12px",
            opacity: isLastScene ? 0.35 : 1,
            cursor: isLastScene ? "not-allowed" : "pointer",
          }}
          aria-label="下一幕"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="10,6 16,12 10,18" />
          </svg>
        </button>

        {isLastScene && !state.isPlaying && (
          <button
            onClick={handleRestart}
            className="archive-link"
            style={{ padding: "8px 14px" }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M4 12a8 8 0 1 1 2.5 5.8" />
              <polyline points="3,11 6.5,17.5 11,14" />
            </svg>
            <span className="ml-1.5 text-[12px]">重播</span>
          </button>
        )}
      </div>

      {/* ─── 当前幕信息 · archive label 风格 ─── */}
      <div className="flex items-center gap-2 mt-1">
        <span
          aria-hidden
          className="block w-4 h-px"
          style={{ background: "var(--accent)", opacity: 0.4 }}
        />
        <span
          className="text-[10.5px] tracking-[0.18em]"
          style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
        >
          {state.currentScene + 1} / {script.scenes.length} · {currentScene.headline_zh}
        </span>
        <span
          aria-hidden
          className="block w-4 h-px"
          style={{ background: "var(--accent)", opacity: 0.4 }}
        />
      </div>
    </div>
  );
}
