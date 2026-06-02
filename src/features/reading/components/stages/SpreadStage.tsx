"use client";

import Link from "next/link";

/**
 * SpreadStage —— 牌阵推荐 + 牌阵自选。
 *
 * 覆盖两个 ReadingStage:
 *   spread_recommending — 显示推荐 + 备选
 *   spread_select       — 手动选择牌阵
 */

import SpreadRecommendation from "@/components/SpreadRecommendation";
import SpreadSelector from "@/components/SpreadSelector";
import SpreadStageLayout from "@/components/SpreadStageLayout";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import { ALL_SPREADS, getSpreadMeta } from "../../lib/spreads";
import type { ReadingStage } from "../../types/reading";
import type { SpreadId, SpreadRecommendation as SpreadRecData } from "@/lib/schema";

type Props = {
  stage: Extract<ReadingStage, "spread_recommending" | "spread_select">;
  spreadRec: SpreadRecData | null;
  selectedSpread: SpreadId | null;
  onPickSpread: (id: SpreadId) => void;
  onConfirmSpread: () => void;
  onOpenManualSelect: () => void;
  onBack: () => void;
};

export default function SpreadStage({
  stage,
  spreadRec,
  selectedSpread,
  onPickSpread,
  onConfirmSpread,
  onOpenManualSelect,
  onBack,
}: Props) {
  const focusId =
    stage === "spread_select"
      ? selectedSpread
      : selectedSpread ?? spreadRec?.spread_id ?? null;

  const guideHref = focusId ? `/guide?spread=${focusId}` : "/guide";

  if (stage === "spread_select") {
    return (
      <SpreadStageLayout>
        <p className="text-center mb-6">
          <Link href={guideHref} className="spread-guide-inline-link">
            查看牌阵规则 →
          </Link>
        </p>
        <SpreadSelector
          spreads={ALL_SPREADS}
          selected={selectedSpread}
          onSelect={(id) => onPickSpread(id as SpreadId)}
          onConfirm={onConfirmSpread}
          onBack={onBack}
        />
      </SpreadStageLayout>
    );
  }

  if (!spreadRec) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <ReadingStatusIndicator status="spread_recommending" />
      </div>
    );
  }

  const recommended = getSpreadMeta(spreadRec.spread_id);

  return (
    <SpreadStageLayout>
      <div className="flex flex-col gap-8 w-full max-w-[560px]">
        <p className="text-center">
          <Link href={guideHref} className="spread-guide-inline-link">
            查看牌阵规则 →
          </Link>
        </p>
        <SpreadRecommendation
          recommended={{
            spread_id: spreadRec.spread_id,
            name_zh: recommended?.name_zh ?? "",
            description_zh: recommended?.description_zh ?? "",
            reason_zh: spreadRec.reason_zh,
            difficulty: recommended?.difficulty ?? "beginner",
          }}
          alternatives={spreadRec.alternatives.map((id) => {
            const meta = getSpreadMeta(id);
            return {
              spread_id: id,
              name_zh: meta?.name_zh ?? "",
              description_zh: meta?.description_zh ?? "",
              difficulty: meta?.difficulty ?? "beginner",
            };
          })}
          onSelect={(id) => {
            onPickSpread(id as SpreadId);
            onConfirmSpread();
          }}
          onBack={onBack}
        />
        <div className="text-center">
          <button
            type="button"
            onClick={onOpenManualSelect}
            className="text-[12px] tracking-[0.04em] underline underline-offset-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            自行选择牌阵
          </button>
        </div>
      </div>
    </SpreadStageLayout>
  );
}
