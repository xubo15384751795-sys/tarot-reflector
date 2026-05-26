"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TarotScene } from "@/lib/schema";
import StepRail from "./StepRail";

type Props = {
  scenes: TarotScene[];
  currentScene: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (idx: number) => void;
  /** 是否为感情领域（在 closing 幕展示额外的保护提示） */
  isLoveDomain?: boolean;
  /** Coda 动作：在最后一幕（建议）的脚部取代 prev/next */
  onReplay?: () => void;
  onWriteNote?: () => void;
  onRephrase?: () => void;
  onSoftClose?: () => void;
};

function IconSpark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M12 4 L13 10 L19 11 L13 12 L12 18 L11 12 L5 11 L11 10 Z" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polyline points="14,6 8,12 14,18" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polyline points="10,6 16,12 10,18" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3" />
    </svg>
  );
}

export default function ReadingPanel({
  scenes,
  currentScene,
  onPrev,
  onNext,
  onJump,
  isLoveDomain = false,
  onReplay,
  onWriteNote,
  onRephrase,
  onSoftClose,
}: Props) {
  const scene = scenes[currentScene];
  if (!scene) return null;

  const steps = scenes.map((s) => s.step_label);
  const atStart = currentScene === 0;
  const atEnd = currentScene === scenes.length - 1;
  const showCoda =
    atEnd && (onReplay || onWriteNote || onRephrase || onSoftClose);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Step rail */}
      <div className="mb-10">
        <StepRail steps={steps} current={currentScene} onJump={onJump} />
      </div>

      {/* Scene body — scroll if it overflows */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col gap-5 max-w-[560px]"
          >
            {/* Headline + subtitle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <h2 className="scene-title text-[34px] md:text-[40px] font-light tracking-[-0.015em] leading-[1.1]" style={{ color: "var(--text-primary)" }}>
                  {scene.headline}
                </h2>
                <span style={{ color: "var(--accent)", opacity: 0.6 }} className="mb-1">
                  <IconSpark />
                </span>
              </div>
              {scene.subtitle && (
                <p className="text-[13px] tracking-[0.04em]" style={{ color: "var(--text-tertiary)" }}>
                  {scene.subtitle}
                </p>
              )}
            </div>

            {/* Insight pull-quote */}
            {scene.insight && (
              <div className="insight-card">
                <p className="text-[15px] leading-[1.7] tracking-[-0.005em]" style={{ color: "var(--text-primary)" }}>
                  {scene.insight}
                </p>
              </div>
            )}

            {/* Body paragraphs */}
            {scene.body && (
              <div className="flex flex-col gap-3">
                {scene.body.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className="scene-body text-[14px] leading-[1.75] tracking-[-0.003em] whitespace-pre-line"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Connection-to-question subcard */}
            {scene.connection && (
              <div className="subcard mt-2 flex gap-3">
                <span className="mt-1 shrink-0" style={{ color: "var(--accent)", opacity: 0.55 }}>
                  <IconLink />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="annotation text-[12px] tracking-[0.04em]" style={{ color: "var(--text-tertiary)" }}>
                    与问题的连接
                  </p>
                  <p className="text-[13.5px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
                    {scene.connection}
                  </p>
                </div>
              </div>
            )}

            {/* 感情类问题的固定保护提示 — 仅在最后一幕（建议）出现一次 */}
            {isLoveDomain && atEnd && (
              <div className="subcard mt-2" style={{ borderColor: "rgba(185,149,82,0.20)" }}>
                <p className="text-[12px] leading-[1.75] tracking-[0.01em]" style={{ color: "var(--text-faint)" }}>
                  这张牌不能替对方发言，但可以帮你看见自己在这段关系里的感受。
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer：常规幕用上一幕/下一幕；最后一幕换成 Coda 四个温柔动作 */}
      {showCoda ? (
        <div className="mt-8 pt-6 flex flex-col gap-3" style={{ borderTop: "1px solid var(--border-glass)" }}>
          <p className="text-[12px] tracking-[0.04em] mb-1" style={{ color: "var(--text-faint)" }}>
            到这里你可以——
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {onReplay && (
              <button onClick={onReplay} className="coda-action coda-primary">
                <span className="coda-glyph">↻</span>
                <span>继续看这个问题</span>
              </button>
            )}
            {onWriteNote && (
              <button onClick={onWriteNote} className="coda-action">
                <span className="coda-glyph">✎</span>
                <span>写下我的感受</span>
              </button>
            )}
            {onRephrase && (
              <button onClick={onRephrase} className="coda-action">
                <span className="coda-glyph">↺</span>
                <span>我想换个问法</span>
              </button>
            )}
            {onSoftClose && (
              <button onClick={onSoftClose} className="coda-action coda-quiet">
                <span className="coda-glyph">·</span>
                <span>到这里就好</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 mt-8 pt-6" style={{ borderTop: "1px solid var(--border-glass)" }}>
          <button
            onClick={onPrev}
            disabled={atStart}
            className="action-pill"
            style={{ opacity: atStart ? 0.3 : 1, cursor: atStart ? "not-allowed" : "pointer" }}
          >
            <IconChevronLeft />
            <span>上一幕</span>
          </button>

          <button
            onClick={onNext}
            disabled={atEnd}
            className="btn-primary"
            style={{
              opacity: atEnd ? 0.3 : 1,
              cursor: atEnd ? "not-allowed" : "pointer",
              background: atEnd
                ? undefined
                : "linear-gradient(135deg, var(--accent), var(--accent-soft))",
              color: "var(--text-primary)",
              padding: "12px 26px",
              fontSize: "14px",
            }}
          >
            <span>下一幕</span>
            <IconChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
