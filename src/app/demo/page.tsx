"use client";

/**
 * /demo — 短视频拍摄专用工作台
 *
 * 用途：录抖音/小红书/B 站塔罗短视频。
 *
 * 流程：选牌 → 自动按节奏 (默认 4s/motif) 逐个高亮符号 + 箭头 + 大字幕。
 *       "纯净模式"隐藏所有工具栏，只留 stage，方便屏幕录制。
 *       URL query: ?card=the_star&motif=2&pure=1&ratio=9-16  可直接外部跳转。
 *
 * 三种比例：9:16（抖音）/ 1:1（小红书）/ 16:9（B 站横屏）。
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import tarotCards from "@/data/tarot_cards.json";
import type { Motif, Orientation } from "@/lib/schema";
import DemoAnnotatedCard from "@/components/DemoAnnotatedCard";

type TarotCardLite = {
  id: string;
  zh_name: string;
  name: string;
  number?: number;
  image: string;
  motifs: Motif[];
};

const CARDS = tarotCards as unknown as TarotCardLite[];

type Ratio = "9-16" | "1-1" | "16-9";

const RATIOS: Array<{ value: Ratio; label: string; w: number; h: number; hint: string }> = [
  { value: "9-16", label: "9:16", w: 9, h: 16, hint: "抖音 / 视频号" },
  { value: "1-1", label: "1:1", w: 1, h: 1, hint: "小红书" },
  { value: "16-9", label: "16:9", w: 16, h: 9, hint: "B 站横屏" },
];

const DEFAULT_PER_MOTIF_MS = 4000;

export default function DemoPageWrapper() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg-base)", minHeight: "100vh" }} />}>
      <DemoPage />
    </Suspense>
  );
}

function DemoPage() {
  const router = useRouter();
  const params = useSearchParams();

  // ── URL → state ──
  const cardId = params.get("card") || CARDS[0].id;
  const card = useMemo(() => CARDS.find((c) => c.id === cardId) ?? CARDS[0], [cardId]);

  const orientation: Orientation =
    params.get("orient") === "reversed" ? "reversed" : "upright";

  const ratio = (params.get("ratio") as Ratio) || "9-16";
  const ratioCfg = RATIOS.find((r) => r.value === ratio) ?? RATIOS[0];

  const pure = params.get("pure") === "1";

  // motif=0..N-1 表示具体某个 motif，motif=null/-1 表示"展示整张牌、无标注"
  const motifParam = params.get("motif");
  const activeIdx: number | null =
    motifParam == null || motifParam === "-1"
      ? null
      : Math.max(-1, Math.min(card.motifs.length - 1, parseInt(motifParam, 10)));

  // ── 本地 state（不放 URL）──
  const [playing, setPlaying] = useState(false);
  const [perMotifMs, setPerMotifMs] = useState(DEFAULT_PER_MOTIF_MS);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL 同步辅助 ──
  const setQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`/demo?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  // ── 播放循环：到末尾停下，不循环 ──
  useEffect(() => {
    if (!playing) return;
    if (activeIdx == null) {
      setQuery({ motif: "0" });
      return;
    }
    playTimer.current = setTimeout(() => {
      const next = activeIdx + 1;
      if (next >= card.motifs.length) {
        setPlaying(false);
        return;
      }
      setQuery({ motif: String(next) });
    }, perMotifMs);
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, [playing, activeIdx, card.motifs.length, perMotifMs, setQuery]);

  // ── 切牌时回到无标注状态 + 停止播放 ──
  const handlePickCard = (id: string) => {
    setPlaying(false);
    setQuery({ card: id, motif: null });
  };
  const handleFlip = () => {
    setQuery({ orient: orientation === "upright" ? "reversed" : null });
  };
  const handlePrev = () => {
    setPlaying(false);
    const next = activeIdx == null ? card.motifs.length - 1 : Math.max(-1, activeIdx - 1);
    setQuery({ motif: next < 0 ? null : String(next) });
  };
  const handleNext = () => {
    setPlaying(false);
    const next = activeIdx == null ? 0 : Math.min(card.motifs.length - 1, activeIdx + 1);
    setQuery({ motif: String(next) });
  };
  const handleReplay = () => {
    setPlaying(false);
    setTimeout(() => {
      setQuery({ motif: "0" });
      setPlaying(true);
    }, 50);
  };
  const handlePlayPause = () => {
    if (playing) setPlaying(false);
    else {
      if (activeIdx == null || activeIdx >= card.motifs.length - 1)
        setQuery({ motif: "0" });
      setPlaying(true);
    }
  };
  const handleTogglePure = () => {
    setQuery({ pure: pure ? null : "1" });
  };

  // ── 键盘快捷键：空格 = 播放/暂停, ← → = 翻 motif, P = 纯净, R = 重播 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "KeyP") {
        handleTogglePure();
      } else if (e.code === "KeyR") {
        handleReplay();
      } else if (e.code === "KeyF") {
        handleFlip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 处理函数是稳定的引用模式，按需读 closure 的最新 state
  }, [playing, activeIdx, card.motifs.length, pure, orientation]);

  const activeMotif = activeIdx != null ? card.motifs[activeIdx] : null;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* 顶部工具栏（纯净模式隐藏） */}
      {!pure && (
        <header
          className="flex items-center gap-3 px-5 py-3 border-b text-[12px]"
          style={{ borderColor: "var(--border-glass)", background: "var(--bg-elevated)" }}
        >
          <div className="tracking-[0.22em] text-[11px]" style={{ color: "var(--accent)" }}>
            ✦ 演示工作台
          </div>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <select
            value={card.id}
            onChange={(e) => handlePickCard(e.target.value)}
            className="bg-transparent border rounded-md px-2 py-1 text-[12px] focus:outline-none"
            style={{ borderColor: "var(--border-glass)", color: "var(--text-primary)" }}
          >
            {CARDS.map((c) => (
              <option key={c.id} value={c.id} style={{ background: "var(--bg-elevated)" }}>
                {c.zh_name} · {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleFlip}
            className="px-3 py-1 rounded-md border text-[11px] tracking-[0.04em]"
            style={{ borderColor: "var(--border-glass)", color: "var(--text-secondary)" }}
            title="F"
          >
            {orientation === "upright" ? "正位" : "逆位"}
          </button>

          <div className="ml-4 flex gap-1">
            {RATIOS.map((r) => (
              <button
                key={r.value}
                onClick={() => setQuery({ ratio: r.value === "9-16" ? null : r.value })}
                className="px-2 py-1 rounded-md border text-[11px]"
                style={{
                  borderColor: r.value === ratio ? "var(--accent)" : "var(--border-glass)",
                  color: r.value === ratio ? "var(--accent)" : "var(--text-secondary)",
                  background: r.value === ratio ? "var(--accent-dim)" : "transparent",
                }}
                title={r.hint}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <span>节奏</span>
            <input
              type="range"
              min={1500}
              max={8000}
              step={250}
              value={perMotifMs}
              onChange={(e) => setPerMotifMs(parseInt(e.target.value, 10))}
              style={{ width: 110 }}
            />
            <span className="tabular-nums w-[42px] text-right">{(perMotifMs / 1000).toFixed(1)}s</span>
          </div>

          <button
            onClick={handleTogglePure}
            className="ml-2 px-3 py-1 rounded-md border text-[11px] tracking-[0.04em]"
            style={{
              borderColor: pure ? "var(--accent)" : "var(--border-glass)",
              color: pure ? "var(--accent)" : "var(--text-secondary)",
            }}
            title="P"
          >
            {pure ? "退出纯净" : "纯净模式"}
          </button>
        </header>
      )}

      {/* Stage 区 */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <DemoStage ratio={ratioCfg}>
          <DemoAnnotatedCard
            image={card.image}
            cardName={card.name}
            zhName={card.zh_name}
            orientation={orientation}
            motifs={card.motifs}
            activeIdx={activeIdx}
          />
          {/* 大字幕区：在底部，仅在 active 时出现 */}
          {activeMotif && (
            <div
              className="absolute left-0 right-0 px-6"
              style={{
                bottom: ratio === "16-9" ? "6%" : "8%",
                pointerEvents: "none",
              }}
            >
              <motion.div
                key={`caption-${activeIdx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div
                  className="text-[22px] md:text-[28px] tracking-[0.06em] font-light"
                  style={{
                    color: "var(--text-primary)",
                    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  }}
                >
                  {activeMotif.label}
                </div>
                <div
                  className="mt-2 text-[13px] md:text-[15px] leading-[1.6] max-w-[28ch] mx-auto"
                  style={{
                    color: "rgba(214, 178, 109, 0.92)",
                    textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {activeMotif.meaning}
                </div>
              </motion.div>
            </div>
          )}

          {/* 顶部牌名 + 序号（纯净模式也保留，作为视频本身的一部分） */}
          <div
            className="absolute left-0 right-0 top-[5%] text-center"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="text-[11px] tracking-[0.32em]"
              style={{ color: "rgba(214, 178, 109, 0.85)" }}
            >
              {card.number != null ? romanize(card.number) : ""}
            </div>
            <div
              className="text-[18px] md:text-[22px] tracking-[0.08em] font-light mt-0.5"
              style={{ color: "var(--text-primary)", textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
            >
              {card.zh_name}
            </div>
          </div>
        </DemoStage>
      </div>

      {/* 底部播放控制（纯净模式隐藏） */}
      {!pure && (
        <footer
          className="flex items-center justify-center gap-3 px-5 py-3 border-t"
          style={{ borderColor: "var(--border-glass)", background: "var(--bg-elevated)" }}
        >
          <ControlBtn onClick={handlePrev} hint="← 上一个 motif">⏮</ControlBtn>
          <ControlBtn onClick={handlePlayPause} primary hint="空格 播放/暂停">
            {playing ? "⏸" : "▶"}
          </ControlBtn>
          <ControlBtn onClick={handleNext} hint="→ 下一个 motif">⏭</ControlBtn>
          <ControlBtn onClick={handleReplay} hint="R 重播">↻</ControlBtn>

          <div
            className="ml-6 text-[11px] tracking-[0.04em]"
            style={{ color: "var(--text-faint)" }}
          >
            {activeIdx == null
              ? `共 ${card.motifs.length} 个 motif`
              : `${activeIdx + 1} / ${card.motifs.length}`}
          </div>

          <div
            className="ml-6 text-[10px] tracking-[0.06em]"
            style={{ color: "var(--text-faint)" }}
          >
            空格 播放 · ← → 翻 motif · F 翻牌 · P 纯净 · R 重播
          </div>
        </footer>
      )}
    </div>
  );
}

function DemoStage({
  ratio,
  children,
}: {
  ratio: { value: Ratio; w: number; h: number };
  children: React.ReactNode;
}) {
  // 按比例锁定 stage：高度优先，宽度自适应；超过容器时反过来宽度优先
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: `${ratio.w} / ${ratio.h}`,
        // 9:16 优先撑高度；1:1 / 16:9 都让宽度撑满（带 max-h 保护）
        height: ratio.value === "9-16" ? "min(90vh, 1280px)" : undefined,
        width: ratio.value === "9-16" ? undefined : "min(94vw, 1280px)",
        maxWidth: "94vw",
        maxHeight: "90vh",
        borderRadius: 16,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(214,178,109,0.06) 0%, transparent 60%), linear-gradient(180deg, #0a0809 0%, #0d0c11 100%)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      {/* 内部留白：牌相对 stage 适度缩小，给 caption / arrow 空间 */}
      <div className="absolute inset-[12%_8%_22%_8%]">{children}</div>
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  primary,
  hint,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className="flex items-center justify-center transition-all"
      style={{
        width: primary ? 48 : 36,
        height: primary ? 48 : 36,
        borderRadius: 999,
        border: `1px solid ${primary ? "var(--accent)" : "var(--border-glass)"}`,
        background: primary ? "var(--accent-dim)" : "transparent",
        color: primary ? "var(--accent)" : "var(--text-secondary)",
        fontSize: primary ? 18 : 14,
      }}
    >
      {children}
    </button>
  );
}

const ROMAN = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ", "Ⅺ", "Ⅻ", "ⅩⅢ", "ⅩⅣ", "ⅩⅤ", "ⅩⅥ", "ⅩⅦ", "ⅩⅧ", "ⅩⅨ", "ⅩⅩ", "ⅩⅪ"];
function romanize(n: number): string {
  if (n === 0) return "0";
  return ROMAN[n] ?? String(n);
}
