"use client";

/**
 * ErrorStage —— 抽牌或生成失败后的兜底。
 */

type Props = {
  message?: string | null;
  onBack: () => void;
};

export default function ErrorStage({ message, onBack }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
          {message ?? "抽牌失败，请重试"}
        </p>
        <button type="button" onClick={onBack} className="action-pill">
          返回
        </button>
      </div>
    </div>
  );
}
