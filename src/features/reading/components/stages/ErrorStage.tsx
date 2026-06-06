"use client";

/**
 * ErrorStage —— 抽牌或生成失败后的兜底。
 * 失败也是一次「档案中断」，保持品牌语气：不报错，只是这页没能展开。
 */

import {
  CornerOrnament,
  DividerLine,
  ArchiveLabel,
} from "@/components/ArchiveEmblems";

type Props = {
  message?: string | null;
  onBack: () => void;
};

export default function ErrorStage({ message, onBack }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
      <div className="error-stage">
        <CornerOrnament size={20} position="tl" className="error-stage__corner error-stage__corner--tl" />
        <CornerOrnament size={20} position="tr" className="error-stage__corner error-stage__corner--tr" />
        <CornerOrnament size={20} position="bl" className="error-stage__corner error-stage__corner--bl" />
        <CornerOrnament size={20} position="br" className="error-stage__corner error-stage__corner--br" />

        <div className="error-stage__emblem" aria-hidden>
          <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
            <rect
              x="14"
              y="6"
              width="36"
              height="52"
              rx="5"
              stroke="var(--accent)"
              strokeWidth="1.1"
              opacity="0.5"
            />
            <path
              d="M32 18 L33.4 29 L44 31 L33.4 33 L32 44 L30.6 33 L20 31 L30.6 29 Z"
              fill="var(--accent)"
              opacity="0.32"
            />
            <line
              x1="20"
              y1="50"
              x2="44"
              y2="14"
              stroke="var(--accent)"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray="2 4"
              opacity="0.55"
            />
          </svg>
        </div>

        <div className="error-stage__rule">
          <DividerLine width={28} />
          <ArchiveLabel code="COD.PAUSE" />
          <DividerLine width={28} />
        </div>

        <h2 className="error-stage__title">这一页没能展开</h2>
        <p className="error-stage__body">
          牌面停在了半途。可以再翻一次，或回到入口重新开始。
        </p>
        {message && <p className="error-stage__detail">{message}</p>}

        <div className="error-stage__actions">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary error-stage__retry"
          >
            再翻一次
          </button>
          <button type="button" onClick={onBack} className="action-pill">
            返回入口
          </button>
        </div>
      </div>
    </div>
  );
}
