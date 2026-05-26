"use client";

/**
 * 顶部进度条 —— 已完成阶段可点击回跳（drawing/shuffling 例外）。
 */

import type { ReadingMode } from "@/lib/schema";
import type { ReadingStage } from "../types/reading";

type Step = { id: ReadingStage; label: string };

const DAILY_STEPS: Step[] = [
  { id: "shuffling", label: "抽牌" },
  { id: "position_readings", label: "解读" },
  { id: "summary", label: "收束" },
];

const FULL_STEPS: Step[] = [
  { id: "question_reframing", label: "理解问题" },
  { id: "spread_recommending", label: "选择角度" },
  { id: "shuffling", label: "抽取牌面" },
  { id: "position_readings", label: "逐张解读" },
  { id: "summary", label: "综合收束" },
];

const HIDDEN_STAGES: ReadingStage[] = [
  "safety_exit",
  "spread_select",
  "relationships",
  "reflection_note",
  "completed",
  "error",
];

type Props = {
  mode: ReadingMode;
  stage: ReadingStage;
  onJump: (stage: ReadingStage) => void;
};

export default function ReadingFlowProgress({ mode, stage, onJump }: Props) {
  const steps = mode === "daily" ? DAILY_STEPS : FULL_STEPS;
  // 把 card_revealed 等同于 shuffling，统一映射到"抽取牌面"这一格
  const stageForLookup: ReadingStage =
    stage === "card_revealed" || stage === "generating_reading"
      ? "shuffling"
      : stage;
  const idx = steps.findIndex((s) => s.id === stageForLookup);

  if (mode === "daily") return null;
  if (idx < 0) return null;
  if (HIDDEN_STAGES.includes(stage)) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2 px-6">
      {steps.map((step, i) => {
        const isActive = i === idx;
        const isDone = i < idx;
        // shuffling 是瞬态，回退会触发洗牌动画+重新生成，破坏当前 readingResult
        const canGoBack = isDone && step.id !== "shuffling";
        const handleClick = canGoBack ? () => onJump(step.id) : undefined;
        return (
          <div key={step.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className="w-6 h-px transition-colors duration-500"
                style={{
                  background: isDone ? "var(--accent)" : "var(--border-glass)",
                }}
              />
            )}
            <button
              type="button"
              onClick={handleClick}
              disabled={!canGoBack}
              title={
                canGoBack
                  ? `回到「${step.label}」`
                  : isActive
                    ? `当前：${step.label}`
                    : step.label
              }
              className="flex items-center gap-1.5 group"
              style={{
                cursor: canGoBack ? "pointer" : "default",
                background: "transparent",
                border: "none",
                padding: 0,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-500 group-hover:scale-110"
                style={{
                  background: isActive
                    ? "var(--accent)"
                    : isDone
                      ? "var(--accent-dim)"
                      : "transparent",
                  border: `1px solid ${
                    isActive
                      ? "var(--accent)"
                      : isDone
                        ? "var(--accent)"
                        : "var(--border-glass)"
                  }`,
                  color: isActive
                    ? "#fff"
                    : isDone
                      ? "var(--accent)"
                      : "var(--text-faint)",
                }}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className="text-[11px] tracking-[0.02em] hidden sm:inline transition-colors duration-500 group-hover:text-[color:var(--text-primary)]"
                style={{
                  color: isActive
                    ? "var(--text-primary)"
                    : isDone
                      ? "var(--accent)"
                      : "var(--text-faint)",
                }}
              >
                {step.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
