"use client";

import {
  readingStatusText,
  type ReadingStatusKey,
} from "@/lib/readingStatusCopy";

type Props = {
  status: ReadingStatusKey;
  className?: string;
};

/** 居中 spinner + 状态文案，用于各 Stage 的等待态 */
export default function ReadingStatusIndicator({ status, className }: Props) {
  return (
    <div
      className={className ?? "flex flex-col items-center justify-center gap-6"}
      role="status"
      aria-live="polite"
    >
      <div
        className="w-5 h-5 rounded-full animate-spin"
        style={{
          border: "1px solid var(--border-glass)",
          borderTopColor: "var(--accent)",
        }}
        aria-hidden
      />
      <p
        className="text-[12px] tracking-[0.18em]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {readingStatusText(status)}
      </p>
    </div>
  );
}
