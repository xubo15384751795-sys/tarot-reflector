"use client";

/**
 * /explain · 短视频科普工作台
 *
 * 与 /reading 是两条独立的产品线：
 *   - /reading：个人解读（带着问题来反思）
 *   - /explain：任意挑一张牌，逐个 motif 高亮+科普讲解，给短视频拍摄用
 *
 * URL 参数（OBS / 录屏场景预设）：
 *   ?card=the_star      — 选中哪张牌
 *   ?motif=2            — 跳到第几个 motif（1-based；0 或缺省 = 整张展示）
 *   ?aspect=9:16        — 9:16 / 1:1 / 16:9
 *   ?pure=1             — 纯净模式（隐藏所有 UI 给录屏）
 *
 * 数据来源：78 张（大阿尔卡那 tarot_cards.json + 四花色 minor JSON）
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import { ExplainMotifLabel } from "@/components/ExplainMotifLabel";
import { CornerOrnament, DividerLine } from "@/components/ArchiveEmblems";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useMotifStepObserver } from "@/features/motion";
import {
  EXPLAIN_TABS,
  loadExplainTab,
  type ExplainCard,
  type ExplainMotif,
  type ExplainTabId,
} from "@/lib/explainCards";

type Aspect = "9:16" | "1:1" | "16:9";

function aspectClass(a: Aspect): string {
  switch (a) {
    case "9:16":
      return "aspect-[9/16] max-w-[360px]";
    case "1:1":
      return "aspect-square max-w-[440px]";
    case "16:9":
      return "aspect-video max-w-[720px]";
  }
}

function ExplainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") ?? "major") as ExplainTabId;
  const initialCardId = searchParams.get("card") ?? "";
  const initialMotifIdx = (() => {
    const raw = Number(searchParams.get("motif"));
    return Number.isFinite(raw) && raw > 0 ? raw - 1 : -1;
  })();
  const initialAspect = (searchParams.get("aspect") ?? "9:16") as Aspect;
  const initialPure = searchParams.get("pure") === "1";

  const [activeTab, setActiveTab] = useState<ExplainTabId>(
    EXPLAIN_TABS.some((t) => t.id === initialTab) ? initialTab : "major",
  );
  const [tabData, setTabData] = useState<{
    tab: ExplainTabId;
    cards: ExplainCard[];
  } | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>(initialCardId);
  const [activeMotifIdx, setActiveMotifIdx] = useState<number>(initialMotifIdx);
  const [aspect, setAspect] = useState<Aspect>(initialAspect);
  const [pure, setPure] = useState<boolean>(initialPure);
  const [playing, setPlaying] = useState(false);
  const [perMotifSec, setPerMotifSec] = useState(4);

  useEffect(() => {
    let cancelled = false;
    loadExplainTab(activeTab)
      .then((list) => {
        if (cancelled) return;
        setTabData({ tab: activeTab, cards: list });
        setSelectedCardId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          return list[0]?.id ?? "";
        });
        setActiveMotifIdx(-1);
        setPlaying(false);
      })
      .catch(() => {
        if (!cancelled) setTabData({ tab: activeTab, cards: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const loadingTab = !tabData || tabData.tab !== activeTab;
  const cards = useMemo(
    () => (tabData?.tab === activeTab ? tabData.cards : []),
    [tabData, activeTab],
  );

  const card = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? cards[0],
    [cards, selectedCardId],
  );
  const motifs = card?.motifs ?? [];
  const activeMotif = activeMotifIdx >= 0 ? motifs[activeMotifIdx] ?? null : null;

  // URL 同步（用 replaceState，不进 history 栈）
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("tab", activeTab);
    if (selectedCardId) sp.set("card", selectedCardId);
    if (activeMotifIdx >= 0) sp.set("motif", String(activeMotifIdx + 1));
    sp.set("aspect", aspect);
    if (pure) sp.set("pure", "1");
    const url = `/explain?${sp.toString()}`;
    window.history.replaceState(null, "", url);
  }, [activeTab, selectedCardId, activeMotifIdx, aspect, pure]);

  // 自动播放：按 perMotifSec 推进
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setActiveMotifIdx((i) => {
        const next = i + 1;
        if (next >= motifs.length) {
          setPlaying(false);
          return motifs.length - 1;
        }
        return next;
      });
    }, perMotifSec * 1000);
    return () => clearTimeout(t);
  }, [playing, activeMotifIdx, motifs.length, perMotifSec]);

  const handleSelectCard = useCallback((id: string) => {
    setSelectedCardId(id);
    setActiveMotifIdx(-1);
    setPlaying(false);
  }, []);

  const handlePlay = useCallback(() => {
    if (activeMotifIdx < 0) setActiveMotifIdx(0);
    setPlaying((p) => !p);
  }, [activeMotifIdx]);

  const handlePrev = useCallback(() => {
    setActiveMotifIdx((i) => Math.max(-1, i - 1));
    setPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setActiveMotifIdx((i) => Math.min(motifs.length - 1, i + 1));
    setPlaying(false);
  }, [motifs.length]);

  const handleRestart = useCallback(() => {
    setActiveMotifIdx(0);
    setPlaying(true);
  }, []);

  const stageGestureRef = useRef<HTMLDivElement>(null);
  const gestureHandlers = useMemo(
    () => ({ onPrev: handlePrev, onNext: handleNext }),
    [handlePrev, handleNext],
  );
  useMotifStepObserver(
    stageGestureRef,
    gestureHandlers,
    motifs.length > 0,
  );

  if (loadingTab) {
    return (
      <AppShell showActions={false}>
        <div className="min-h-[50vh] flex items-center justify-center">
          <ReadingStatusIndicator status="archive_browsing" />
        </div>
      </AppShell>
    );
  }

  if (!card) return null;

  const stage = (
    <ExplainStage
      card={card}
      activeMotif={activeMotif}
      activeMotifIdx={activeMotifIdx}
      aspect={aspect}
    />
  );

  // 纯净模式：只渲染舞台 + 退出小按钮
  if (pure) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div ref={stageGestureRef} className="explain-stage-gesture flex justify-center">
          {stage}
        </div>
        <button
          onClick={() => setPure(false)}
          className="archive-link absolute top-5 right-5"
          style={{ padding: "8px 16px" }}
          aria-label="退出纯净模式"
        >
          <span className="text-[11px]">退出纯净</span>
        </button>
      </div>
    );
  }

  return (
    <AppShell showActions={false}>
      <div className="relative min-h-[calc(100vh-60px)] flex flex-col items-center">
        {/* 背景纹饰 */}
        <CornerOrnament size={28} position="tl" className="absolute top-3 left-3 hidden sm:block" style={{ opacity: 0.18 }} />
        <CornerOrnament size={28} position="tr" className="absolute top-3 right-3 hidden sm:block" style={{ opacity: 0.18 }} />

        <div className="relative z-[1] w-full max-w-[920px] px-5 md:px-8 py-6 md:py-8 flex flex-col gap-6">
          {/* 顶部 archive 标题 + 工具栏 */}
          <div className="flex flex-col items-center gap-3">
            <SectionHeader
              kicker="COD · EXP"
              title="科普工作台"
              subtitle="挑一张牌 · 逐个元素讲解 · 录屏友好"
            />
          </div>

          {/* 工具栏：比例 + 节奏 + 纯净 */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(["9:16", "1:1", "16:9"] as Aspect[]).map((a) => (
              <button
                key={a}
                onClick={() => setAspect(a)}
                className={`hero-chip ${aspect === a ? "is-active" : ""}`}
              >
                <span>{a}</span>
              </button>
            ))}
            <div
              className="archive-link"
              style={{
                padding: "8px 14px",
                gap: 8,
                cursor: "default",
              }}
              role="group"
              aria-label="单 motif 停留"
            >
              <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                每幕
              </span>
              <select
                value={perMotifSec}
                onChange={(e) => setPerMotifSec(Number(e.target.value))}
                aria-label="每幕停留秒数"
                className="bg-transparent outline-none text-[12px] tracking-[0.04em]"
                style={{ color: "var(--text-primary)" }}
              >
                {[3, 4, 5, 6, 8].map((s) => (
                  <option key={s} value={s} style={{ background: "var(--bg-elevated)" }}>
                    {s}s
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setPure(true)}
              className="archive-link"
              style={{ padding: "8px 16px" }}
              title="进入纯净模式（隐藏 UI，适合录屏）"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
              </svg>
              <span className="text-[11px]">纯净录屏</span>
            </button>
          </div>

          {/* 舞台（支持滑动手势切幕） */}
          <div
            ref={stageGestureRef}
            className="explain-stage-gesture flex justify-center w-full touch-pan-y"
          >
            {stage}
          </div>
          <p
            className="text-center text-[10px] tracking-[0.1em] -mt-2"
            style={{ color: "var(--text-faint)" }}
          >
            在舞台上滑动可切换符号讲解
          </p>

          {/* 控件 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={activeMotifIdx <= -1}
                className="archive-link"
                style={{ padding: "8px 12px", opacity: activeMotifIdx <= -1 ? 0.35 : 1 }}
                aria-label="上一幕"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="14,6 8,12 14,18" />
                </svg>
              </button>
              <button onClick={handlePlay} className="hero-cta" style={{ padding: "10px 24px" }} aria-label={playing ? "暂停" : "播放"}>
                {playing ? (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
                <span className="ml-2 text-[12.5px] tracking-[0.10em]">{playing ? "暂停" : "播放"}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={activeMotifIdx >= motifs.length - 1}
                className="archive-link"
                style={{ padding: "8px 12px", opacity: activeMotifIdx >= motifs.length - 1 ? 0.35 : 1 }}
                aria-label="下一幕"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="10,6 16,12 10,18" />
                </svg>
              </button>
              <button onClick={handleRestart} className="archive-link" style={{ padding: "8px 12px" }} aria-label="重播">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M4 12a8 8 0 1 1 2.5 5.8" />
                  <polyline points="3,11 6.5,17.5 11,14" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden className="block w-4 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
              <span
                className="text-[10.5px] tracking-[0.18em]"
                style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
              >
                {activeMotifIdx < 0
                  ? `整 张 · ${card.zh_name}`
                  : `${activeMotifIdx + 1} / ${motifs.length} · ${motifs[activeMotifIdx]?.label_zh ?? motifs[activeMotifIdx]?.label ?? ""}`}
              </span>
              <span aria-hidden className="block w-4 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            </div>
          </div>

          {/* 牌组切换 + 选择器 */}
          <GlassCard padding="md" glow className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {EXPLAIN_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`hero-chip ${activeTab === t.id ? "is-active" : ""}`}
                >
                  <span>{t.label}</span>
                  <span className="opacity-60 ml-1">{t.count}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3">
              <DividerLine width={28} />
              <span
                className="text-[10px] tracking-[0.22em]"
                style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
              >
                {EXPLAIN_TABS.find((t) => t.id === activeTab)?.label} · {cards.length} 张
                {activeTab !== "major" ? " · 符号坐标为示意" : ""}
              </span>
              <DividerLine width={28} />
            </div>
            <p className="text-center text-[10px] tracking-[0.06em]" style={{ color: "var(--text-faint)" }}>
              完整 78 张档案与精确标注见{" "}
              <Link href="/archive" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>
                牌义档案库
              </Link>
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-11 gap-2 justify-items-center">
              {cards.map((c) => {
                const isSel = c.id === selectedCardId;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCard(c.id)}
                    className="group flex flex-col items-center gap-1"
                    aria-label={c.zh_name}
                    title={c.zh_name}
                  >
                    <div
                      className="relative overflow-hidden rounded-[5px] transition-all"
                      style={{
                        width: 44,
                        aspectRatio: "600/1050",
                        border: isSel
                          ? "1.5px solid var(--accent)"
                          : "1px solid var(--border-glass)",
                        boxShadow: isSel
                          ? "0 0 16px var(--accent-a3), 0 4px 12px rgba(0,0,0,0.25)"
                          : "0 2px 6px rgba(0,0,0,0.22)",
                        opacity: isSel ? 1 : 0.78,
                      }}
                    >
                      <Image
                        src={c.image}
                        alt={c.zh_name}
                        fill
                        sizes="44px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span
                      className="text-[9px] tracking-[0.04em] leading-none"
                      style={{
                        color: isSel ? "var(--accent)" : "var(--text-faint)",
                      }}
                    >
                      {c.zh_name}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* 退路：返回主站 */}
          <div className="flex justify-center pt-4 pb-8">
            <button
              onClick={() => router.push("/")}
              className="text-[11px] tracking-[0.04em] underline underline-offset-4"
              style={{
                color: "var(--text-faint)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * 舞台：固定比例容器 + 牌图 + 当前 motif 高亮（带弧线+大字幕）
 */
function ExplainStage({
  card,
  activeMotif,
  activeMotifIdx,
  aspect,
}: {
  card: ExplainCard;
  activeMotif: ExplainMotif | null;
  activeMotifIdx: number;
  aspect: Aspect;
}) {
  const anchor = activeMotif?.anchor ?? null;
  return (
    <div
      className={`relative w-full ${aspectClass(aspect)} rounded-2xl overflow-hidden`}
      style={{
        border: "1px solid var(--accent-a3)",
        background:
          "radial-gradient(ellipse 70% 50% at 50% 38%, var(--accent-a2) 0%, transparent 65%), linear-gradient(180deg, #0a0810 0%, #0d0c11 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,247,225,0.08), 0 24px 56px rgba(0,0,0,0.55)",
      }}
    >
      {/* 噪点 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "240px 240px",
          mixBlendMode: "overlay",
        }}
      />

      {/* 四角档案纹饰 */}
      <CornerOrnament size={22} position="tl" className="absolute top-3 left-3 z-[1]" style={{ opacity: 0.5 }} />
      <CornerOrnament size={22} position="tr" className="absolute top-3 right-3 z-[1]" style={{ opacity: 0.5 }} />
      <CornerOrnament size={22} position="bl" className="absolute bottom-3 left-3 z-[1]" style={{ opacity: 0.5 }} />
      <CornerOrnament size={22} position="br" className="absolute bottom-3 right-3 z-[1]" style={{ opacity: 0.5 }} />

      {/* 顶部品牌 + 牌名 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-1">
        <span
          className="text-[9px] tracking-[0.30em]"
          style={{ color: "var(--accent)", opacity: 0.75, fontFamily: "var(--font-serif-like)" }}
        >
          阈 牌
        </span>
        <span
          className="text-[12px] tracking-[0.08em]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}
        >
          {card.zh_name}
        </span>
      </div>

      {/* 牌图区 */}
      <div className="absolute inset-0 flex items-center justify-center pt-12 pb-24 px-6 z-[2]">
        <div
          className="relative"
          style={{
            height: "100%",
            aspectRatio: "600/1050",
            maxWidth: "min(100%, 240px)",
          }}
        >
          {/* 牌底椭圆阴影 */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              bottom: -8,
              left: "10%",
              right: "10%",
              height: 14,
              borderRadius: 999,
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 75%)",
              filter: "blur(8px)",
            }}
          />
          {/* 牌图 */}
          <div
            className="relative w-full h-full overflow-hidden rounded-[10px]"
            style={{
              border: "1px solid var(--accent-a3)",
              boxShadow:
                "inset 0 1px 0 rgba(255,247,225,0.12), 0 16px 36px rgba(0,0,0,0.55)",
            }}
          >
            <Image
              src={card.image}
              alt={card.zh_name}
              fill
              sizes="240px"
              className="object-contain"
              priority
            />

            {/* 活跃 motif：锚点柔光（避免生硬方框；坐标相对完整牌面） */}
            <AnimatePresence>
              {activeMotif && anchor && (
                <motion.div
                  key={activeMotif.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="motif-spot motif-spot--explain"
                  style={{
                    left: `${anchor.x * 100}%`,
                    top: `${anchor.y * 100}%`,
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 底部讲解条 */}
      <AnimatePresence mode="wait">
        {activeMotif ? (
          <motion.div
            key={`motif-${activeMotif.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
            className="absolute left-0 right-0 bottom-6 z-[3] flex justify-center px-5"
          >
            <GlassCard padding="sm" className="relative max-w-[88%] text-center">
              <ExplainMotifLabel
                text={activeMotif.label_zh ?? activeMotif.label}
                className="text-[14px] md:text-[15px] leading-[1.55] tracking-[0.02em] mb-1"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-serif-like)",
                  fontWeight: 500,
                }}
              />
              <p
                className="text-[12px] md:text-[12.5px] leading-[1.6]"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-serif-like)",
                }}
              >
                {activeMotif.meaning_zh ?? activeMotif.meaning}
              </p>
              <p
                className="text-[9.5px] tracking-[0.12em] mt-2"
                style={{ color: "var(--text-faint)", opacity: 0.7 }}
              >
                {activeMotifIdx + 1} / {card.motifs.length}
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          // 整张展示：底部显示牌名 + 关键词
          <motion.div
            key="whole"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute left-0 right-0 bottom-6 z-[3] flex flex-col items-center gap-2 px-5"
          >
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[88%]">
              {(card.upright?.keywords ?? []).slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-a1)",
                    color: "var(--accent)",
                    border: "1px solid var(--accent-a3)",
                    fontFamily: "var(--font-serif-like)",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExplainPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ReadingStatusIndicator status="archive_browsing" />
        </div>
      }
    >
      <ExplainContent />
    </Suspense>
  );
}
