"use client";

/**
 * ReadingStage —— 解读展开阶段。
 *
 * 覆盖四个 ReadingStage:
 *   spread_overview     — 牌阵总览
 *   position_readings   — 逐张解读（多牌） / 单牌全景
 *   relationships       — 牌间关系
 *   summary             — 收束
 */

import { useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import AnnotatedCard from "@/components/AnnotatedCard";
import ReadingPanel from "@/components/ReadingPanel";
import CardReveal from "@/components/CardReveal";
import SpreadOverview from "@/components/SpreadOverview";
import CardPositionReading from "@/components/CardPositionReading";
import RelationshipAnalysis from "@/components/RelationshipAnalysis";
import ReadingSummary from "@/components/ReadingSummary";
import tarotCards from "@/data/tarot_cards.json";
import type { DrawnCard } from "@/lib/schema";
import { getSpreadDef } from "../../lib/spreads";
import type { ReadingScript, ReadingStage as Stage } from "../../types/reading";

type Props = {
  stage: Extract<
    Stage,
    "spread_overview" | "position_readings" | "relationships" | "summary"
  >;
  script: ReadingScript;
  currentPosition: number;
  domain: string;
  /** 后台 AI 解读尚未返回（用本地兜底先撑住 UI） */
  aiPending: boolean;
  onBeginReadings: () => void;
  onNextPosition: () => void;
  onRelationshipsNext: () => void;
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
    onBeginReadings,
    onNextPosition,
    onRelationshipsNext,
    onReplay,
    onWriteNote,
    onSummary,
    onClose,
  } = props;

  const cardCount = script.cards.length;
  const spreadDef = useMemo(() => getSpreadDef(script.spread_id), [script.spread_id]);

  // 单牌模式下的 motif caption（同一张牌内的小注释）
  const captionMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    script.motifs.forEach((m) => {
      const meaning = m.meaning ?? "";
      const trimmed = meaning.replace(/。$/, "").split(/[，·]/).filter(Boolean);
      map[m.id] = trimmed.slice(0, 2).join("\n") || meaning;
    });
    return map;
  }, [script.motifs]);

  // relationships 阶段：本地模板路径无 analysis 时，下一帧自动跳到 summary
  useEffect(() => {
    if (stage === "relationships" && !script.analysis) {
      queueMicrotask(onSummary);
    }
  }, [stage, script.analysis, onSummary]);

  if (stage === "spread_overview") {
    if (!spreadDef) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <p
              className="text-[14px] mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              牌阵信息加载中……
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

  if (stage === "position_readings" && cardCount > 1) {
    const card = script.cards[currentPosition];
    if (!card) return null;
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12 relative">
        {aiPending && <AiPolishingHint />}
        <AnimatePresence mode="wait">
          <CardPositionReading
            key={currentPosition}
            cardImage={card.image}
            cardName={card.card_name}
            zhName={card.zh_name}
            orientation={card.orientation}
            position={{
              index: currentPosition + 1,
              name_zh: card.position_name,
              name_en: card.position_name,
              meaning_zh:
                spreadDef?.positions[currentPosition]?.meaning_zh ?? "",
              warning: spreadDef?.positions[currentPosition]?.warning,
            }}
            motifs={card.motifs}
            reading={script.scenes[currentPosition]?.body ?? ""}
            onNext={onNextPosition}
            isLast={currentPosition === cardCount - 1}
            positionNumber={currentPosition + 1}
            totalCards={cardCount}
          />
        </AnimatePresence>
      </div>
    );
  }

  if (stage === "position_readings") {
    const cardNumber =
      tarotCards.find((c) => c.id === script.card_id)?.number ?? undefined;

    return (
      <div className="flex flex-col relative">
        {aiPending && <AiPolishingHint />}
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <CardReveal
            image={script.image}
            cardName={script.card_name}
            zhName={script.zh_name}
            orientation={script.orientation}
            motifs={script.motifs}
            number={cardNumber}
            onComplete={() => {}}
          />
        </div>
        <div className="px-6 md:px-10 py-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] gap-10 lg:gap-14">
            <section className="flex flex-col">
              <div className="flex-1 flex items-center justify-center px-2">
                <AnnotatedCard
                  image={script.image}
                  cardName={script.card_name}
                  zhName={script.zh_name}
                  orientation={script.orientation}
                  motifs={script.motifs}
                  number={cardNumber}
                  activeMotifId={script.scenes[0]?.focus_motif ?? null}
                  bare={false}
                  captionMap={captionMap}
                />
              </div>
            </section>
            <section className="flex flex-col">
              <ReadingPanel
                scenes={script.scenes}
                currentScene={0}
                onPrev={() => {}}
                onNext={onSummary}
                onJump={() => {}}
                onReplay={onReplay}
                onWriteNote={onWriteNote}
                onSoftClose={onClose}
              />
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "relationships") {
    if (!script.analysis) {
      // useEffect 会把它推到 summary，这里给一个柔和过渡
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div
            className="w-5 h-5 rounded-full animate-spin"
            style={{
              border: "1px solid var(--border-glass)",
              borderTopColor: "var(--accent)",
            }}
          />
        </div>
      );
    }
    const analysis = script.analysis;
    const rels = analysis.relationship_notes.map((note) => ({
      from_card: script.cards[0]?.zh_name ?? "",
      to_card: script.cards[1]?.zh_name ?? "",
      relationship_type: "关联",
      description_zh: note,
    }));
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12">
        <div className="flex flex-col gap-6 w-full max-w-[560px]">
          <RelationshipAnalysis
            relationships={rels}
            narrative={script.thesis}
            tension_points={[]}
            flow_description={`牌阵中出现 ${analysis.major_arcana_count} 张大阿尔卡那，${analysis.reversal_count} 张逆位。`}
            onNext={onRelationshipsNext}
          />
          {domain === "love" && (
            <div
              className="subcard"
              style={{ borderColor: "rgba(185,149,82,0.20)" }}
            >
              <p
                className="text-[12px] leading-[1.75] tracking-[0.01em]"
                style={{ color: "var(--text-faint)" }}
              >
                这张牌不能替对方发言，但可以帮你看见自己在这段关系里的感受。
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === "summary") {
    const analysis = script.analysis ?? {
      major_arcana_count: 0,
      suit_counts: {} as Record<string, number>,
      reversal_count: 0,
      element_balance: {} as Record<string, number>,
      relationship_notes: [] as string[],
    };
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12">
        <div className="flex flex-col items-center gap-8 w-full max-w-[560px]">
          <ReadingSummary
            title={script.title}
            summary={script.thesis}
            cards={script.cards.map((c) => ({
              card_id: c.card_id,
              zh_name: c.zh_name,
              image: c.image,
              orientation: c.orientation,
              position_name: c.position_name,
              position_index: c.position_index,
            }))}
            analysis={{
              major_arcana_count: analysis.major_arcana_count,
              dominant_suit:
                Object.entries(analysis.suit_counts ?? {}).sort(
                  (a, b) => b[1] - a[1],
                )[0]?.[0] ?? null,
              reversal_count: analysis.reversal_count,
              relationship_notes: analysis.relationship_notes ?? [],
            }}
            onReplay={onReplay}
            onWriteNote={onWriteNote}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return null;
}

/**
 * 安静的状态条：本地兜底已经在屏，AI 还在后台撰写。
 * 不阻挡交互；仅在 aiPending 期间出现，AI 落地或失败后由父级收回。
 */
function AiPolishingHint() {
  return (
    <div className="ai-polishing-hint" role="status" aria-live="polite">
      <span className="ai-polishing-hint__dot" aria-hidden />
      <span className="ai-polishing-hint__text">正在为你润色这段解读……</span>
    </div>
  );
}
