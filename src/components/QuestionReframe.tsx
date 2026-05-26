"use client";

import { motion } from "framer-motion";
import { CornerOrnament, DividerLine } from "./ArchiveEmblems";

type Props = {
  original: string;
  tension: string;
  reframed: string;
  onAccept: () => void;
  onEdit: () => void;
  /** 用户拒绝系统给的"观察"，不复述，直接用 original 抽牌。 */
  onSkip: () => void;
};

function IconQuote() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M7 10c-2 0-3 1-3 3 0 1.5 1 2 3 2 1 0 2-.5 2-2 0-3-2-5-5-5" />
      <path d="M16 10c-2 0-3 1-3 3 0 1.5 1 2 3 2 1 0 2-.5 2-2 0-3-2-5-5-5" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" />
    </svg>
  );
}

function IconPen() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

export default function QuestionReframe({
  original,
  tension,
  reframed,
  onAccept,
  onEdit,
  onSkip,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[520px] mx-auto flex flex-col gap-8"
    >
      {/* Original question — subdued */}
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0" style={{ color: "var(--text-faint)", opacity: 0.5 }}>
          <IconQuote />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.12em]" style={{ color: "var(--text-faint)" }}>
            你最初的问题
          </span>
          <p className="text-[14px] leading-[1.7] italic" style={{ color: "var(--text-tertiary)" }}>
            &ldquo;{original}&rdquo;
          </p>
        </div>
      </div>

      <DividerLine width={36} className="mx-auto" />

      {/* Tension insight card */}
      <div className="insight-card">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)", opacity: 0.6 }}>
            <IconSpark />
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[0.14em]" style={{ color: "var(--accent)", opacity: 0.7 }}>
              一个观察
            </span>
            <p className="text-[14px] leading-[1.75] tracking-[-0.003em]" style={{ color: "var(--text-primary)" }}>
              {tension}
            </p>
          </div>
        </div>
      </div>

      {/* Reframed question — emphasized */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="block w-6 h-px" style={{ background: "var(--accent)", opacity: 0.3 }} />
          <span
            className="text-[10px] tracking-[0.16em]"
            style={{ color: "var(--ink-warm)", fontFamily: "var(--font-serif-like)" }}
          >
            换 个 角 度 看
          </span>
          <span className="block w-6 h-px" style={{ background: "var(--accent)", opacity: 0.3 }} />
        </div>
        <p
          className="hero-title text-[22px] md:text-[28px] lg:text-[32px] font-light leading-[1.4] tracking-[-0.012em]"
          style={{ color: "var(--text-primary)" }}
        >
          {reframed}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
        <button onClick={onAccept} className="hero-cta" style={{ padding: "13px 36px" }}>
          <IconSpark />
          <span className="ml-2 tracking-[0.06em]">用这个角度抽牌</span>
        </button>
        <button onClick={onEdit} className="archive-link" type="button" style={{ padding: "11px 24px" }}>
          <IconPen />
          <span>我想换个问法</span>
        </button>
      </div>

      {/* 第三选项 · 拒绝复述权（视觉权重最低，但永远在）
          用户主权：如果系统给的"一个观察"不像自己，可以跳过 reframe
          直接用原问题抽牌，而不必整个回首页重来。 */}
      <div className="flex justify-center -mt-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-[11px] tracking-[0.04em] underline underline-offset-4 transition-opacity"
          style={{
            color: "var(--text-faint)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: 0.7,
          }}
        >
          这个观察不太像我，直接抽牌
        </button>
      </div>

      <div className="flex justify-center">
        <CornerOrnament size={20} position="bl" />
        <span className="block w-8 h-px self-center mx-2" style={{ background: "var(--ink-filigree)" }} />
        <CornerOrnament size={20} position="br" />
      </div>
    </motion.div>
  );
}
