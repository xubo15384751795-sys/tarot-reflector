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
 * 数据来源：src/data/tarot_cards.json（22 张 major arcana，含 motif bbox）
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import { CornerOrnament, DividerLine } from "@/components/ArchiveEmblems";
import tarotCardsData from "@/data/tarot_cards.json";

type Motif = {
  id: string;
  label: string;
  meaning: string;
  bbox: { x: number; y: number; w: number; h: number };
};

type ExplainCard = {
  id: string;
  zh_name: string;
  name: string;
  number?: number | null;
  image: string;
  core_symbols: string[];
  upright: { keywords: string[]; meaning: string };
  motifs: Motif[];
};

const CARDS = (tarotCardsData as ExplainCard[]).filter(
  (c) => Array.isArray(c.motifs) && c.motifs.length > 0,
);

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

  const initialCardId = searchParams.get("card") ?? CARDS[0]?.id;
  const initialMotifIdx = (() => {
    const raw = Number(searchParams.get("motif"));
    return Number.isFinite(raw) && raw > 0 ? raw - 1 : -1; // -1 = 整张展示
  })();
  const initialAspect = (searchParams.get("aspect") ?? "9:16") as Aspect;
  const initialPure = searchParams.get("pure") === "1";

  const [selectedCardId, setSelectedCardId] = useState<string>(initialCardId);
  const [activeMotifIdx, setActiveMotifIdx] = useState<number>(initialMotifIdx);
  const [aspect, setAspect] = useState<Aspect>(initialAspect);
  const [pure, setPure] = useState<boolean>(initialPure);
  const [playing, setPlaying] = useState(false);
  /** 每个 motif 自动停留秒数 */
  const [perMotifSec, setPerMotifSec] = useState(4);

  const card = useMemo(
    () => CARDS.find((c) => c.id === selectedCardId) ?? CARDS[0],
    [selectedCardId],
  );
  const motifs = card?.motifs ?? [];
  const activeMotif = activeMotifIdx >= 0 ? motifs[activeMotifIdx] ?? null : null;

  // URL 同步（用 replaceState，不进 history 栈）
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("card", selectedCardId);
    if (activeMotifIdx >= 0) sp.set("motif", String(activeMotifIdx + 1));
    sp.set("aspect", aspect);
    if (pure) sp.set("pure", "1");
    const url = `/explain?${sp.toString()}`;
    window.history.replaceState(null, "", url);
  }, [selectedCardId, activeMotifIdx, aspect, pure]);

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
        {stage}
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
            <div className="flex items-center justify-center gap-3">
              <DividerLine width={32} />
              <span
                className="text-[10px] tracking-[0.24em]"
                style={{ color: "var(--accent)", opacity: 0.85, fontFamily: "var(--font-serif-like)" }}
              >
                COD · EXP
              </span>
              <DividerLine width={32} />
            </div>
            <h1
              className="hero-title text-[22px] md:text-[28px] font-light tracking-[-0.012em]"
              style={{ color: "var(--text-primary)" }}
            >
              科普工作台
            </h1>
            <p
              className="text-[11px] tracking-[0.14em] text-center"
              style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
            >
              挑 一 张 牌 · 逐 个 元 素 讲 解 · 录 屏 友 好
            </p>
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

          {/* 舞台 */}
          <div className="flex justify-center">{stage}</div>

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
                  : `${activeMotifIdx + 1} / ${motifs.length} · ${motifs[activeMotifIdx]?.label ?? ""}`}
              </span>
              <span aria-hidden className="block w-4 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            </div>
          </div>

          {/* 牌选择器 */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-center gap-3">
              <DividerLine width={28} />
              <span
                className="text-[10px] tracking-[0.22em]"
                style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
              >
                大 阿 尔 卡 那 · {CARDS.length} 张
              </span>
              <DividerLine width={28} />
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2 justify-items-center">
              {CARDS.map((c) => {
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
                          ? "0 0 16px rgba(214,178,109,0.35), 0 4px 12px rgba(0,0,0,0.25)"
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
          </div>

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
  activeMotif: Motif | null;
  activeMotifIdx: number;
  aspect: Aspect;
}) {
  return (
    <div
      className={`relative w-full ${aspectClass(aspect)} rounded-2xl overflow-hidden`}
      style={{
        border: "1px solid rgba(214,178,109,0.28)",
        background:
          "radial-gradient(ellipse 70% 50% at 50% 38%, rgba(214,178,109,0.14) 0%, transparent 65%), linear-gradient(180deg, #0a0810 0%, #0d0c11 100%)",
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
              border: "1px solid rgba(214,178,109,0.35)",
              boxShadow:
                "inset 0 1px 0 rgba(255,247,225,0.12), 0 16px 36px rgba(0,0,0,0.55)",
            }}
          >
            <Image
              src={card.image}
              alt={card.zh_name}
              fill
              sizes="240px"
              className="object-cover"
              priority
            />

            {/* 活跃 motif 高亮框（按 bbox 定位） */}
            <AnimatePresence>
              {activeMotif && (
                <motion.div
                  key={activeMotif.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${activeMotif.bbox.x * 100}%`,
                    top: `${activeMotif.bbox.y * 100}%`,
                    width: `${activeMotif.bbox.w * 100}%`,
                    height: `${activeMotif.bbox.h * 100}%`,
                    border: "1.5px solid var(--accent)",
                    borderRadius: 6,
                    boxShadow:
                      "0 0 0 2px rgba(214,178,109,0.15), 0 0 18px rgba(214,178,109,0.45)",
                    background:
                      "radial-gradient(ellipse at center, rgba(214,178,109,0.10) 0%, transparent 70%)",
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
            <div
              className="relative px-4 py-3 rounded-lg max-w-[88%] text-center"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,16,12,0.72) 0%, rgba(16,12,8,0.62) 100%)",
                backdropFilter: "blur(14px) saturate(1.2)",
                WebkitBackdropFilter: "blur(14px) saturate(1.2)",
                border: "1px solid rgba(214,178,109,0.32)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,247,225,0.12), 0 6px 18px rgba(0,0,0,0.42)",
              }}
            >
              <span
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -top-[1px] w-6 h-px"
                style={{ background: "var(--accent)", opacity: 0.5 }}
              />
              <p
                className="text-[14px] md:text-[15px] leading-[1.55] tracking-[0.02em] mb-1"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-serif-like)",
                  fontWeight: 500,
                }}
              >
                {activeMotif.label}
              </p>
              <p
                className="text-[12px] md:text-[12.5px] leading-[1.6]"
                style={{
                  color: "rgba(245,236,218,0.92)",
                  fontFamily: "var(--font-serif-like)",
                }}
              >
                {activeMotif.meaning}
              </p>
              <p
                className="text-[9.5px] tracking-[0.12em] mt-2"
                style={{ color: "var(--text-faint)", opacity: 0.7 }}
              >
                {activeMotifIdx + 1} / {card.motifs.length}
              </p>
            </div>
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
                    background: "rgba(214,178,109,0.12)",
                    color: "var(--accent)",
                    border: "1px solid rgba(214,178,109,0.32)",
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
          <div className="w-5 h-5 rounded-full animate-spin" style={{ border: "1px solid var(--border-glass)", borderTopColor: "var(--text-tertiary)" }} />
        </div>
      }
    >
      <ExplainContent />
    </Suspense>
  );
}
