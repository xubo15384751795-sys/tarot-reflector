"use client";

/**
 * RuminationPauseStage —— 反刍护栏暂停页
 *
 * 用户在 24h 内对同一问题抽过 ≥2 次时拦在这里。
 * 不阻断、不评判、不说教——只是给一个温柔的暂停按钮，
 * 让用户决定要不要先停一停。
 */

import { motion } from "framer-motion";
import { DividerLine } from "@/components/ArchiveEmblems";

type Props = {
  count: number;
  /** 用户决定"我先停一下"——回到首页 */
  onPause: () => void;
  /** 用户决定继续——进入正常抽牌流程 */
  onContinue: () => void;
};

export default function RuminationPauseStage({ count, onPause, onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px] mx-auto flex flex-col items-center gap-7 px-6 py-16 text-center"
    >
      <DividerLine width={40} />

      <p
        className="text-[15px] md:text-[16px] leading-[1.85] tracking-[0.005em]"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-serif-like)",
        }}
      >
        你今天已经为这件事翻过 {count} 次档案了。
        <br />
        <br />
        要不要先合上一会儿，给自己一个
        <br />
        不被追问的下午？
      </p>

      <DividerLine width={40} />

      {/* 默认按钮是"先停一下"——抗反刍设计：让健康的选项更显眼 */}
      <div className="flex flex-col items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onPause}
          className="hero-cta"
          style={{ padding: "13px 36px" }}
        >
          <span className="tracking-[0.12em]">我先停一下</span>
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="text-[11px] tracking-[0.04em] underline underline-offset-4"
          style={{
            color: "var(--text-faint)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: 0.7,
          }}
        >
          我知道，但我想再看一次
        </button>
      </div>
    </motion.div>
  );
}
