"use client";

/**
 * VideoProgressBar — 短片进度条
 * 玻璃槽 + 暖金 fill + 衬线时间标签，和主站光感一致。
 */

type Props = {
  currentScene: number;
  totalScenes: number;
  elapsed: number;
  totalDuration: number;
};

export default function VideoProgressBar({
  elapsed,
  totalDuration,
}: Props) {
  const progress = Math.min((elapsed / totalDuration) * 100, 100);

  return (
    <div className="w-full max-w-[320px] flex flex-col gap-2">
      {/* 玻璃槽 + 暖金 fill */}
      <div
        className="relative h-[5px] rounded-full overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.06)",
          boxShadow:
            "inset 0 1px 0 rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,247,225,0.04)",
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, rgba(214,178,109,0.85) 0%, rgba(232,200,150,1) 50%, rgba(214,178,109,0.85) 100%)",
            boxShadow:
              "0 0 6px rgba(214,178,109,0.45), inset 0 1px 0 rgba(255,252,235,0.45)",
          }}
        />
      </div>

      {/* 时间标签 */}
      <div
        className="flex justify-between text-[10px] tracking-[0.08em]"
        style={{
          color: "var(--text-faint)",
          fontFamily: "var(--font-serif-like)",
        }}
      >
        <span>{formatTime(elapsed)}</span>
        <span>{formatTime(totalDuration)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
