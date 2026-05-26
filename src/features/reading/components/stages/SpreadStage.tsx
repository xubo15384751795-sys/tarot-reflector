"use client";

/**
 * SpreadStage —— 牌阵推荐 + 牌阵自选。
 *
 * 覆盖两个 ReadingStage:
 *   spread_recommending — 显示推荐 + 备选
 *   spread_select       — 手动选择牌阵
 */

import SpreadRecommendation from "@/components/SpreadRecommendation";
import SpreadSelector from "@/components/SpreadSelector";
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
  if (stage === "spread_select") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12">
        <SpreadSelector
          spreads={ALL_SPREADS}
          selected={selectedSpread}
          onSelect={(id) => onPickSpread(id as SpreadId)}
          onConfirm={onConfirmSpread}
          onBack={onBack}
        />
      </div>
    );
  }

  if (!spreadRec) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div
          className="w-5 h-5 rounded-full animate-spin"
          style={{
            border: "1px solid var(--border-glass)",
            borderTopColor: "var(--text-tertiary)",
          }}
        />
      </div>
    );
  }

  const recommended = getSpreadMeta(spreadRec.spread_id);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="flex flex-col gap-8 w-full max-w-[560px]">
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
            // 与原 UI 一致：选中即开始抽牌
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
    </div>
  );
}
