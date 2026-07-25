"use client";

/**
 * DrawingStage —— 抽牌（洗牌动画 + 翻开后的即时展示）。
 *
 * 覆盖两个 ReadingStage:
 *   shuffling     — 洗牌动画 + 副标题
 *   card_revealed — 显示首牌 + 本地传统牌义 + 「继续」按钮
 */

import { motion } from "framer-motion";
import CardDeck from "@/components/CardDeck";
import CardReveal from "@/components/CardReveal";
import { readingStatusText } from "@/lib/readingStatusCopy";
import type {
  DrawnCardSnapshot,
  LocalCardMeaning,
  ReadingStage,
} from "../../types/reading";

type Props = {
  stage: Extract<ReadingStage, "shuffling" | "card_revealed">;
  drawnCards: DrawnCardSnapshot[] | null;
  localMeanings: LocalCardMeaning[];
  onContinue: () => void;
};

export default function DrawingStage({
  stage,
  drawnCards,
  localMeanings,
  onContinue,
}: Props) {
  if (stage === "shuffling") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <CardDeck
          isShuffling
          onShuffleComplete={() => {}}
          statusText={readingStatusText("shuffling")}
        />
      </div>
    );
  }

  const firstCard = drawnCards?.[0];
  if (!firstCard) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <CardDeck
          isShuffling
          onShuffleComplete={() => {}}
          statusText={readingStatusText("generating_reading")}
        />
      </div>
    );
  }

  const localMeaning = localMeanings[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 gap-6">
      {/* 翻牌这一刻只在这里发生一次；position_readings 不再重画一张同样的牌 */}
      <CardReveal
        image={firstCard.image}
        cardName={firstCard.card_name_en}
        zhName={firstCard.card_name_zh}
        orientation={firstCard.orientation}
        motifs={[]}
      />

      {firstCard.position_name_zh && (drawnCards?.length ?? 0) > 1 && (
        <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>
          {firstCard.position_name_zh}
        </p>
      )}

      {localMeaning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="max-w-[360px] text-center"
        >
          <div className="flex flex-wrap gap-1.5 justify-center mb-3">
            {localMeaning.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                {kw}
              </span>
            ))}
          </div>
          <p
            className="text-[13px] leading-[1.7]"
            style={{ color: "var(--text-secondary)" }}
          >
            {localMeaning.meaning}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        className="mt-3"
      >
        <button
          type="button"
          onClick={onContinue}
          className="hero-cta"
          style={{ padding: "13px 36px" }}
        >
          <span className="tracking-[0.12em]">继续 →</span>
        </button>
      </motion.div>
    </div>
  );
}
