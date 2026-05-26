"use client";

/**
 * VideoSubtitle — 短片字幕条
 *
 * 用 site 自己的玻璃语言：translucent 暖黑底 + backdrop blur + 衬线字 + 金边。
 * 替换原来 OS-toolip 风格的实色黑泡。
 */

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  text: string;
  /** 字幕位置：底部或中部 */
  position?: "bottom" | "center";
};

export default function VideoSubtitle({ text, position = "bottom" }: Props) {
  return (
    <div
      className="absolute left-0 right-0 z-20 flex justify-center px-5"
      style={{
        bottom: position === "bottom" ? "10%" : "50%",
        transform: position === "center" ? "translateY(50%)" : undefined,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative px-4 py-2.5 rounded-md max-w-[280px] text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,12,0.62) 0%, rgba(16,12,8,0.55) 100%)",
            backdropFilter: "blur(14px) saturate(1.2)",
            WebkitBackdropFilter: "blur(14px) saturate(1.2)",
            border: "1px solid rgba(214,178,109,0.28)",
            boxShadow:
              "inset 0 1px 0 rgba(255,247,225,0.12), 0 4px 12px rgba(0,0,0,0.28)",
          }}
        >
          {/* 上下短金线，archive label 味 */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -top-[1px] w-6 h-px"
            style={{ background: "var(--accent)", opacity: 0.5 }}
          />
          <p
            className="text-[13px] leading-[1.55] tracking-[0.02em]"
            style={{
              color: "rgba(245,236,218,0.95)",
              fontFamily: "var(--font-serif-like)",
            }}
          >
            {text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
