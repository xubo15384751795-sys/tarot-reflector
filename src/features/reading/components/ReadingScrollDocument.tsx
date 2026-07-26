"use client";

/**
 * ReadingScrollDocument —— 解读的连续卷轴。
 *
 * 取代原本「一屏一张牌 + 继续翻阅按钮」的幻灯片：
 *   - 牌面 sticky 在左侧，随滚动切换到当前正在读的那张
 *   - 逐张解读、牌间关系、收束在右侧连续向下展开
 *
 * 这样用户随时能往回翻看前一张的解读，AI 后台返回时新内容是
 * 「长出来」而不是整页替换；也不再需要「已完成阶段可点回跳、
 * 但一半是禁用的」那种顶部进度条补丁。
 *
 * 滚动位置 → currentPosition 由 IntersectionObserver 回报，
 * 会话状态机仍是唯一事实来源。
 */

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import AnnotatedCard from "@/components/AnnotatedCard";
import { useReducedMotion, easeSoft } from "@/features/motion";
import RelationshipAnalysis from "@/components/RelationshipAnalysis";
import ReadingSummary from "@/components/ReadingSummary";
import { readingStatusText } from "@/lib/readingStatusCopy";
import { getSpreadDef } from "../lib/spreads";
import type { ReadingScript } from "../types/reading";

/**
 * 牌阵构成的一句话描述。
 * 原来是模板串「牌阵中出现 0 张大阿尔卡那，0 张逆位。」——
 * 数字为 0 时读起来像没写完的占位符，这里按实际情况措辞。
 */
function describeSpreadShape(majorCount: number, reversalCount: number): string {
  const parts: string[] = [];
  if (majorCount > 0) {
    parts.push(`出现 ${majorCount} 张大阿尔卡那，说明这件事的分量不只在日常层面`);
  } else {
    parts.push("全部是小阿尔卡那，这次问的是具体的、可以动手调整的层面");
  }
  if (reversalCount > 0) {
    parts.push(`其中 ${reversalCount} 张逆位`);
  } else {
    parts.push("没有逆位");
  }
  return parts.join("；") + "。";
}

/* ── 滚动编排 ──────────────────────────────────────────────
   段落进入视口时：金脊先自上而下画出来，文字随后逐条浮起。
   位移只有 14px，但用 spring 而不是线性淡入 —— 读起来是「落定」，
   不是「渐显」。once: true，往回滚不会重播（重播很烦人）。

   之所以敢让初始态是 opacity 0：解读页的内容完全在客户端渲染
   （SSR HTML 里只有 Suspense fallback，实测 0 处 reading-scroll 标记），
   React 跑不起来时用户看到的是等待态而不是隐形文字。
   ——首页大标题不能这么做，那里的文字是服务端就发出去的。
   ═════════════════════════════════════════════════════════ */

const REVEAL_VIEWPORT = { once: true, amount: 0.2 } as const;

const sectionVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const spineVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  shown: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.62, ease: easeSoft },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 130, damping: 22, mass: 0.9 },
  },
};

type Props = {
  script: ReadingScript;
  domain: string;
  /** 当前聚焦的牌（左侧 sticky 牌面显示哪一张） */
  currentPosition: number;
  /** 牌面解读尚在展开（本地兜底已先展示） */
  aiPending: boolean;
  /** 解读超时时的柔和提示 */
  readingSlowHint: boolean;
  /** 滚动进入某一张牌的解读时回报 */
  onPositionInView: (index: number) => void;
  /** 滚动到收束段时回报（用于放出分享/保存动作） */
  onReachSummary: () => void;
  onReplay: () => void;
  onWriteNote: () => void;
  onClose: () => void;
};

export default function ReadingScrollDocument({
  script,
  domain,
  currentPosition,
  aiPending,
  readingSlowHint,
  onPositionInView,
  onReachSummary,
  onReplay,
  onWriteNote,
  onClose,
}: Props) {
  const reducedMotion = useReducedMotion();
  const spreadDef = getSpreadDef(script.spread_id);
  const cards = script.cards.length > 0 ? script.cards : null;
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const summaryRef = useRef<HTMLElement | null>(null);

  // 回调放进 ref：observer 只建一次，不因父组件 re-render 反复重建
  const onPositionInViewRef = useRef(onPositionInView);
  const onReachSummaryRef = useRef(onReachSummary);
  useEffect(() => {
    onPositionInViewRef.current = onPositionInView;
    onReachSummaryRef.current = onReachSummary;
  });

  const cardCount = cards?.length ?? 0;
  const hasAnalysis = Boolean(script.analysis) && cardCount > 1;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 判定线是视口 45% 处的一条零高度线（见下方 rootMargin），
        // 所以同一时刻只会有一段横跨它 —— 不用比可见面积，取那一段即可。
        // 早先用「可见比例最高」判定：段落只有 100 多 px 高时，
        // 好几段会同时完整落在判定带里，比例都是 1，选出来的是最后进入
        // 观察队列的那段，往回滚会切错牌。
        const crossing = entries.find((e) => e.isIntersecting);
        if (!crossing) return;

        const target = crossing.target as HTMLElement;
        if (target.dataset.section === "summary") {
          onReachSummaryRef.current();
          return;
        }
        const idx = Number(target.dataset.positionIndex);
        if (Number.isInteger(idx)) onPositionInViewRef.current(idx);
      },
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
    );

    for (const el of sectionRefs.current) if (el) observer.observe(el);
    if (summaryRef.current) observer.observe(summaryRef.current);

    return () => observer.disconnect();
    // 关系段也占一个 slot，所以段数是 cardCount + 1
  }, [cardCount, hasAnalysis]);

  const registerSection = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionRefs.current[index] = el;
    },
    [],
  );

  if (!cards) return null;

  const activeCard = cards[Math.min(currentPosition, cards.length - 1)];
  const analysis = script.analysis;
  const isMultiCard = cards.length > 1;

  return (
    <div className="reading-scroll">
      {(aiPending || readingSlowHint) && (
        <div className="reading-pending-hint" role="status" aria-live="polite">
          <span className="reading-pending-hint__dot" aria-hidden />
          <span className="reading-pending-hint__text">
            {readingStatusText(aiPending ? "linking_context" : "reading_slow")}
          </span>
        </div>
      )}

      <div className="reading-scroll__layout">
        {/* ── 左：跟随滚动的牌面 ───────────────────────── */}
        <aside className="reading-scroll__stage">
          <div className="reading-scroll__stage-inner">
            {isMultiCard && (
              <div className="reading-scroll__ticks" aria-hidden>
                {cards.map((c, i) => (
                  <span
                    key={c.card_id + i}
                    className={`reading-scroll__tick${
                      i === currentPosition ? " is-active" : ""
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 换牌不是硬切：旧牌向下沉一点、淡出，新牌从稍高处落定。
                位移很小（10px）但带 mass，读起来是「换了一张实物」，
                而不是「图片被替换了」。 */}
            {/* mode="wait"：旧牌先沉下去淡出，新牌再落定。
                不用 popLayout —— 那会让新旧两张同时在场，需要一个定高
                堆叠槽，而 AnnotatedCard 内部是 archive-layout 三栏网格，
                一旦被塞进 grid 槽位就撑破 sticky 列。 */}
            <div className="reading-scroll__card-slot">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeCard.card_id + activeCard.position_index}
                  className="w-full"
                  initial={reducedMotion ? false : { opacity: 0, y: -10, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
                  transition={
                    reducedMotion
                      ? { duration: 0.12 }
                      : { type: "spring", stiffness: 120, damping: 20, mass: 1.05 }
                  }
                >
                  <AnnotatedCard
                    image={activeCard.image}
                    cardName={activeCard.card_name}
                    zhName={activeCard.zh_name}
                    orientation={activeCard.orientation}
                    motifs={activeCard.motifs}
                    activeMotifId={
                      script.scenes[currentPosition]?.focus_motif ?? null
                    }
                    bare={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="reading-scroll__stage-caption">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={activeCard.card_id}
                  className="reading-scroll__stage-name"
                  initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.26, ease: easeSoft }}
                >
                  {activeCard.zh_name}
                </motion.span>
              </AnimatePresence>
              <span className="reading-scroll__stage-orientation">
                {activeCard.orientation === "upright" ? "正位" : "逆位"}
              </span>
            </p>
          </div>
        </aside>

        {/* ── 右：连续向下的解读 ───────────────────────── */}
        <div className="reading-scroll__flow">
          <header className="reading-scroll__intro">
            <h1 className="reading-scroll__title">{script.title}</h1>
            {script.thesis && (
              <p className="reading-scroll__thesis">{script.thesis}</p>
            )}
          </header>

          {cards.map((card, i) => {
            const position = spreadDef?.positions[i];
            return (
              <motion.section
                key={card.card_id + i}
                ref={registerSection(i)}
                data-position-index={i}
                className={`reading-scroll__section${
                  i === currentPosition ? " is-current" : ""
                }`}
                aria-label={`第 ${i + 1} 张：${card.zh_name}`}
                variants={sectionVariants}
                initial={reducedMotion ? false : "hidden"}
                whileInView="shown"
                viewport={REVEAL_VIEWPORT}
              >
                {/* 金脊是真实元素而不是 ::before —— 伪元素没法交给 Framer
                    编排。它从上往下「画」出来，正好领着下面的文字入场。 */}
                <motion.span
                  className="reading-scroll__spine"
                  aria-hidden
                  variants={spineVariants}
                />

                <motion.div
                  className="reading-scroll__section-head"
                  variants={itemVariants}
                >
                  {isMultiCard && (
                    <span className="reading-scroll__ordinal">
                      {i + 1} / {cards.length}
                    </span>
                  )}
                  <h2 className="reading-scroll__position">
                    {card.position_name}
                  </h2>
                  {/* 窄屏没有 sticky 牌面，牌名要跟在段落里 */}
                  <span className="reading-scroll__card-inline">
                    {card.zh_name} ·{" "}
                    {card.orientation === "upright" ? "正位" : "逆位"}
                  </span>
                </motion.div>

                {position?.meaning_zh && (
                  <motion.p
                    className="reading-scroll__position-meaning"
                    variants={itemVariants}
                  >
                    {position.meaning_zh}
                  </motion.p>
                )}

                {position?.warning && (
                  <motion.p
                    className="reading-scroll__warning"
                    variants={itemVariants}
                  >
                    {position.warning}
                  </motion.p>
                )}

                <motion.p
                  className="reading-scroll__body"
                  variants={itemVariants}
                >
                  {script.scenes[i]?.body ?? ""}
                </motion.p>
              </motion.section>
            );
          })}

          {isMultiCard && analysis && (
            <section
              ref={registerSection(cards.length)}
              /* 关系段沿用最后一张牌，这样直接跳滚到这里时 sticky 牌面
                 也停在最后一张，而不是停留在跳滚前的那张 */
              data-position-index={cards.length - 1}
              className="reading-scroll__section reading-scroll__section--relations"
              aria-label="牌与牌之间"
            >
              {/* 标题由 RelationshipAnalysis 自己渲染，这里不要再来一个 */}
              <RelationshipAnalysis
                relationships={analysis.relationship_notes.map((note) => ({
                  from_card: cards[0]?.zh_name ?? "",
                  to_card: cards[1]?.zh_name ?? "",
                  relationship_type: "关联",
                  description_zh: note,
                }))}
                narrative={script.thesis}
                tension_points={[]}
                flow_description={describeSpreadShape(
                  analysis.major_arcana_count,
                  analysis.reversal_count,
                )}
              />
              {domain === "love" && (
                <p className="reading-scroll__caveat">
                  这张牌不能替对方发言，但可以帮你看见自己在这段关系里的感受。
                </p>
              )}
            </section>
          )}

          <section
            ref={summaryRef}
            data-section="summary"
            className="reading-scroll__section reading-scroll__section--summary"
            aria-label="收束"
          >
            <ReadingSummary
              title={script.title}
              summary={script.thesis}
              cards={cards.map((c) => ({
                card_id: c.card_id,
                zh_name: c.zh_name,
                image: c.image,
                orientation: c.orientation,
                position_name: c.position_name,
                position_index: c.position_index,
              }))}
              analysis={{
                major_arcana_count: analysis?.major_arcana_count ?? 0,
                dominant_suit:
                  Object.entries(analysis?.suit_counts ?? {}).sort(
                    (a, b) => b[1] - a[1],
                  )[0]?.[0] ?? null,
                reversal_count: analysis?.reversal_count ?? 0,
                relationship_notes: analysis?.relationship_notes ?? [],
              }}
              onReplay={onReplay}
              onWriteNote={onWriteNote}
              onClose={onClose}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
