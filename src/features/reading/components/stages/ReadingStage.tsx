"use client";

/**
 * ReadingStage —— 解读展开阶段。
 *
 *   spread_overview   — 牌阵总览（独立的一屏：先看清牌怎么摆的）
 *   position_readings
 *   relationships     ─┬─ 同一份 ReadingScrollDocument：牌面 sticky，解读连续向下
 *   summary           ─┘
 *
 * 后三个阶段刻意共用一个文档实例。stage 不再决定「显示哪一屏」，
 * 只表示「读到哪了」——所以往回滚看上一张不会把会话状态倒回去，
 * AI 后台返回时也是原地长出内容而不是整页替换。
 */

import { useMemo } from "react";
import SpreadOverview from "@/components/SpreadOverview";
import type { DrawnCard } from "@/lib/schema";
import { readingStatusText } from "@/lib/readingStatusCopy";
import { getSpreadDef } from "../../lib/spreads";
import ReadingScrollDocument from "../ReadingScrollDocument";
import type { ReadingScript, ReadingStage as Stage } from "../../types/reading";

type Props = {
  stage: Extract<
    Stage,
    "spread_overview" | "position_readings" | "relationships" | "summary"
  >;
  script: ReadingScript;
  currentPosition: number;
  domain: string;
  /** 牌面解读尚在展开（本地兜底已先展示） */
  aiPending: boolean;
  /** 解读超时时的柔和提示 */
  readingSlowHint: boolean;
  onBeginReadings: () => void;
  /** 卷轴滚到第 N 张时回报 */
  onFocusPosition: (index: number) => void;
  onSummary: () => void;
  onReplay: () => void;
  onWriteNote: () => void;
  onClose: () => void;
};

export default function ReadingStage(props: Props) {
  const {
    stage,
    script,
    currentPosition,
    domain,
    aiPending,
    readingSlowHint,
    onBeginReadings,
    onFocusPosition,
    onSummary,
    onReplay,
    onWriteNote,
    onClose,
  } = props;

  const spreadDef = useMemo(
    () => getSpreadDef(script.spread_id),
    [script.spread_id],
  );

  if (stage === "spread_overview") {
    if (!spreadDef) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <p
              className="text-[14px] mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {readingStatusText("spread_recommending")}
            </p>
            <button onClick={onBeginReadings} className="btn-primary">
              继续解读
            </button>
          </div>
        </div>
      );
    }

    const cards: DrawnCard[] = script.cards.map((c, i) => ({
      card: {
        id: c.card_id,
        name_zh: c.zh_name,
        name_en: c.card_name,
        image: c.image,
        arcana: "minor",
        traditional: {
          upright: { keywords_zh: [], meaning_zh: "" },
          reversed: { keywords_zh: [], meaning_zh: "" },
        },
        symbolic_components: { combined_rule_zh: "" },
        domain_mapping: {},
        source: { deck: "rws", image_source: "" },
      },
      orientation: c.orientation,
      position: {
        index: i + 1,
        name_zh: c.position_name,
        name_en: c.position_name,
        meaning_zh: "",
      },
      position_index: i,
    }));

    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12">
        <SpreadOverview
          spread={spreadDef}
          cards={cards}
          onBegin={onBeginReadings}
        />
      </div>
    );
  }

  return (
    <ReadingScrollDocument
      script={script}
      domain={domain}
      currentPosition={currentPosition}
      aiPending={aiPending}
      readingSlowHint={readingSlowHint}
      onPositionInView={onFocusPosition}
      onReachSummary={onSummary}
      onReplay={onReplay}
      onWriteNote={onWriteNote}
      onClose={onClose}
    />
  );
}
