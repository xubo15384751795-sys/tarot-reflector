"use client";

type Props = {
  steps: string[];
  current: number;
  onJump?: (index: number) => void;
};

export default function StepRail({ steps, current, onJump }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[12px] tracking-[0.06em]" style={{ color: "var(--text-tertiary)" }}>
          翻阅进度{" "}
          <span style={{ color: "var(--text-primary)" }}>
            {current + 1}
            <span style={{ color: "var(--text-faint)" }}>/</span>
            {steps.length}
          </span>
        </span>
      </div>

      <div
        className="relative grid items-center"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Connector line behind the dots */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{ top: "8px", background: "var(--border-glass)" }}
        />
        <div
          className="absolute h-px transition-all duration-700"
          style={{
            top: "8px",
            left: 0,
            width: `${(current / Math.max(steps.length - 1, 1)) * 100}%`,
            background: "linear-gradient(to right, var(--accent), var(--accent-soft))",
          }}
        />

        {steps.map((label, i) => {
          const status =
            i < current ? "is-done" : i === current ? "is-active" : "";
          const clickable = !!onJump;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump?.(i)}
              disabled={!clickable}
              className={`relative flex flex-col items-center gap-3 z-10 ${
                clickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className={`step-dot ${status}`} />
              <span
                className="text-[11px] tracking-[0.04em] transition-colors"
                style={{
                  color: i === current
                    ? "var(--accent)"
                    : i < current
                    ? "var(--text-tertiary)"
                    : "var(--text-faint)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
