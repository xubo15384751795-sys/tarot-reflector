"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Domain, UserInput } from "@/lib/schema";
import AstrolabeStarCard from "./AstrolabeStarCard";
import { AlchemicalRing, CornerOrnament, ArchiveLabel, DividerLine } from "./ArchiveEmblems";

type Props = {
  onSubmit: (input: UserInput) => void;
};

const domainTips: Record<Domain, string> = {
  love: "这张牌不能替对方发言，但可以帮你看见自己在这段关系里的感受。",
  career: "工作选择没有标准答案，但牌面可以帮你看见当前最值得关注的方向。",
  project: "项目进展往往比你感受的更有序，牌面会帮你找到卡住的那个点。",
  study: "学习不只是为了结果，过程中的每一层理解都在改变你。",
  self: "向内看需要勇气，牌面只是一面镜子，答案始终在你那里。",
  money: "财务不只是数字，它反映的是你和资源之间的关系。",
};

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.6-7-10.5C5 6 7.5 4 10 4c1.4 0 2.5.7 3 1.5C13.5 4.7 14.6 4 16 4c2.5 0 4.5 2 4.5 4.5 0 5.9-7 11.5-7 11.5z" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="7" width="17" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <polyline points="3,7 12,11 21,7" />
      <line x1="12" y1="11" x2="12" y2="21" />
    </svg>
  );
}
function IconGrad() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 9 L12 4 L22 9 L12 14 Z" />
      <path d="M6 11 V16 C6 16 8.5 18 12 18 C15.5 18 18 16 18 16 V11" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5C14.5 8.5 13.4 8 12 8s-2.5.5-2.5 1.7c0 2.6 5 1.6 5 4.6 0 1.2-1.1 1.7-2.5 1.7s-2.5-.5-2.5-1.7" />
      <line x1="12" y1="6.5" x2="12" y2="17.5" />
    </svg>
  );
}
function IconSparkSmall() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3 L20 6 V12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 V6 Z" />
    </svg>
  );
}

const DOMAINS: { value: Domain; label: string; icon: ReactNode }[] = [
  { value: "love", label: "感情", icon: <IconHeart /> },
  { value: "career", label: "工作", icon: <IconBriefcase /> },
  { value: "project", label: "项目", icon: <IconBox /> },
  { value: "study", label: "学习", icon: <IconGrad /> },
  { value: "self", label: "自我", icon: <IconUser /> },
  { value: "money", label: "财务", icon: <IconDollar /> },
];

export default function HeroEntry({ onSubmit }: Props) {
  const [question, setQuestion] = useState("");
  const [domain, setDomain] = useState<Domain>("self");
  // 跨断点布局：把 lg: 媒体查询从 CSS 搬到 React state，这样 DOM 变更可以
  // 被 View Transitions API 包住，浏览器自动 cross-fade 新旧布局，
  // 把所有"瞬切"属性（grid 列、字号、padding、order）一起淡进淡出。
  const [isSplit, setIsSplit] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    // 首次同步不走 VT（避免 SSR 桩到客户端的初始 cross-fade 闪烁）。
    // 媒体查询匹配只能在 client 端知道，必须放在 effect 里；
    // 一次性 sync，不会引发 cascading renders。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSplit(mq.matches);

    const onChange = () => {
      const next = mq.matches;
      const apply = () => setIsSplit(next);
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      };
      if (typeof doc.startViewTransition === "function") {
        doc.startViewTransition(apply);
      } else {
        apply();
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const canSubmit = question.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ question: question.trim(), domain });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSubmit) handleSubmit();
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Ambient lighting layers */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--hero-bg)" }}
      />
      {/* 纸张肌理（极淡噪点） */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          mixBlendMode: "overlay",
        }}
      />
      {/* 烛光氛围（左上暖晕） */}
      <div
        aria-hidden
        className="absolute pointer-events-none candle-glow"
        style={{
          top: "-8%",
          left: "-5%",
          width: "50%",
          height: "50%",
          background: "radial-gradient(ellipse 50% 45% at 25% 25%, var(--candlelight) 0%, transparent 70%)",
        }}
      />
      {/* Sparkle dots scattered across background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22% 18%, rgba(255,255,255,0.45) 0.6px, transparent 1px)," +
            "radial-gradient(circle at 78% 12%, rgba(255,247,225,0.5) 0.7px, transparent 1.2px)," +
            "radial-gradient(circle at 90% 30%, rgba(255,255,255,0.35) 0.5px, transparent 1px)," +
            "radial-gradient(circle at 86% 70%, rgba(255,247,225,0.4) 0.6px, transparent 1px)," +
            "radial-gradient(circle at 8% 50%, rgba(255,255,255,0.3) 0.5px, transparent 1px)," +
            "radial-gradient(circle at 35% 75%, rgba(255,247,225,0.32) 0.6px, transparent 1px)",
          backgroundSize: "100% 100%",
        }}
      />

      {/* Main grid — 列、间距、padding 改成 isSplit state 驱动，
          配合 useEffect 里的 startViewTransition，跨断点时浏览器整页 cross-fade。 */}
      <main
        className={
          "relative z-[1] grid min-h-screen items-start " +
          (isSplit
            ? "grid-cols-[minmax(0,_1.15fr)_minmax(0,_1fr)] gap-16 px-20 pt-24 pb-24"
            : "grid-cols-1 gap-6 px-5 md:px-12 pt-20 md:pt-24 pb-28")
        }
      >
        {/* Hero column */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ viewTransitionName: "hero-text" }}
          className={
            "flex flex-col max-w-[640px] mx-auto " +
            (isSplit
              ? "items-start text-left lg:mx-0"
              : "items-center text-center")
          }
        >
          {/* 档案编号 */}
          <div className="mb-8 flex items-center gap-4">
            <ArchiveLabel code="COD.001" />
            <DividerLine width={32} />
          </div>

          {/* Brand ornament */}
          <div className="flex items-center gap-3 mb-8" style={{ color: "var(--accent)", opacity: 0.75 }}>
            <span className="block w-8 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            <span className="text-[14px] tracking-[0.42em]">阈&nbsp;牌</span>
            <span className="block w-8 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
          </div>

          {/* Subtitle as the main h1 */}
          <h1
            className={
              "hero-title text-[26px] sm:text-[30px] md:text-[40px] leading-[1.28] font-light tracking-[-0.012em] " +
              (isSplit ? "text-[50px] max-w-none" : "max-w-[15ch] sm:max-w-[18ch]")
            }
            style={{ color: "var(--text-primary)" }}
          >
            翻开一页档案，
            {isSplit && <br />}
            看见你问题的结构。
          </h1>

          {/* 引导语 */}
          <p className="mt-8 text-[14px] tracking-[0.02em] leading-[1.75] max-w-[460px] lg:mx-0 mx-auto" style={{ color: "var(--text-tertiary)" }}>
            慢慢写下此刻最占据你的那件事。
            <br className="hidden sm:inline" />
            <span style={{ color: "var(--text-faint)" }}> 这张牌不是答案，是一面古老的镜子。</span>
          </p>

          {/* Input */}
          <div className="mt-5 w-full max-w-[520px] hero-input">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKey}
              placeholder="一个决定、一段关系、一个想看清楚的念头，或者就只是今天的心情……"
              autoFocus
            />
            <span className="hero-input-spark" style={{ color: "var(--accent)", opacity: 0.7 }}>
              <IconSparkSmall />
            </span>
          </div>
          {/* Chips */}
          <div className={"mt-7 flex flex-wrap gap-2.5 " + (isSplit ? "justify-start" : "justify-center")}>
            {DOMAINS.map((d) => {
              const active = domain === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDomain(d.value)}
                  className={`hero-chip ${active ? "is-active" : ""}`}
                >
                  <span style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}>
                    {d.icon}
                  </span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* 领域提示 — 每个领域选中时柔和出现 */}
          <AnimatePresence mode="wait">
            {domainTips[domain] && (
              <motion.div
                key={`tip-${domain}`}
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[520px] overflow-hidden"
              >
                <p className={"mt-5 text-[12px] tracking-[0.02em] leading-[1.7] " + (isSplit ? "text-left" : "text-center")} style={{ color: "var(--text-faint)" }}>
                  {domainTips[domain]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={`hero-cta mt-10 ${canSubmit ? "" : "is-disabled"}`}
          >
            <IconSparkSmall />
            <span className="ml-2 tracking-[0.18em]">看看这一页</span>
          </motion.button>
        </motion.section>

        {/* Visual anchor: Star card with astrolabe.
            结构性约束：牌区高度由 grid 单元格决定，不使用 vh 单位。
            缩放时牌区被 grid cell 限制，永远不会溢出覆盖文字。 */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{ viewTransitionName: "hero-card" }}
          className={"relative flex items-center justify-center max-h-full " + (isSplit ? "order-last" : "order-first")}
        >
          {/* 炼金术圆环背景 — 极淡 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ opacity: 0.2 }}>
            <AlchemicalRing size={380} rings={4} />
          </div>
          {/* 月相 - 右上 */}
          <div className="absolute top-4 right-4 pointer-events-none">
            <div className="candle-glow" style={{ opacity: 0.3 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--brass)" strokeWidth="0.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3 a9 9 0 0 1 0 18" fill="var(--candlelight)" opacity="0.3" />
              </svg>
            </div>
          </div>
          {/* 角饰 */}
          <CornerOrnament size={28} position="tl" className="absolute top-2 left-2" />
          <CornerOrnament size={28} position="tr" className="absolute top-2 right-2" />
          <CornerOrnament size={28} position="bl" className="absolute bottom-2 left-2" />
          <CornerOrnament size={28} position="br" className="absolute bottom-2 right-2" />
          <AstrolabeStarCard />
        </motion.section>
      </main>

      {/* Footer disclaimer */}
      <footer className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 text-[11px] tracking-[0.04em] z-10 px-6 text-center" style={{ color: "var(--text-faint)" }}>
        <span className="shrink-0" style={{ color: "var(--accent)", opacity: 0.55 }}><IconShield /></span>
        <span>基于 Rider–Waite–Smith 传统牌义的图像档案 — 系统不会替你做决定，只照亮牌面上的符号。</span>
      </footer>
    </div>
  );
}
