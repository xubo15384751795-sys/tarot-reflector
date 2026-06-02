"use client";

/**
 * DrawingStage —— 抽牌（洗牌动画 + 翻开后的即时展示）。
 *
 * 覆盖两个 ReadingStage:
 *   shuffling     — 洗牌动画 + 副标题
 *   card_revealed — 显示首牌 + 本地传统牌义 + 「继续」按钮
 */

import Image from "next/image";
import { motion } from "framer-motion";
import CardDeck from "@/components/CardDeck";
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
  const isReversed = firstCard.orientation === "reversed";

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div
          className="card-stage"
          style={{ width: "min(220px, 50vw)", aspectRatio: "600/1050" }}
        >
          <div
            className="absolute inset-0 rounded-[18px] overflow-hidden"
            style={{
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              // 逆位不再 180° 翻转牌图——视觉上倒立的人/牌在低落情绪时会
              // 放大不适感。改用底色微调（轻微暗金描边）+ 标签传达逆位语义。
              border: isReversed
                ? "1.5px solid rgba(146, 110, 60, 0.5)"
                : undefined,
              boxSizing: "border-box",
            }}
          >
            <Image
              src={firstCard.image}
              alt={firstCard.card_name_zh}
              fill
              sizes="220px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <h2
          className="text-[24px] font-light"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-serif-like)",
          }}
        >
          {firstCard.card_name_zh}
          <span className="ml-2 text-[14px]" style={{ color: "var(--accent)" }}>
            {firstCard.orientation_zh}
          </span>
        </h2>
        {firstCard.position_name_zh && (drawnCards?.length ?? 0) > 1 && (
          <p className="text-[12px] mt-1" style={{ color: "var(--text-faint)" }}>
            {firstCard.position_name_zh}
          </p>
        )}
      </motion.div>

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
