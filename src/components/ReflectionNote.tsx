"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onSave: (text: string) => void;
  onSkip: () => void;
  prompt?: string;
};

export default function ReflectionNote({ onSave, onSkip, prompt }: Props) {
  const [text, setText] = useState("");

  const handleSave = () => {
    onSave(text.trim());
  };

  return (
    <motion.div
      key="note-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(8,8,10,0.86) 0%, rgba(0,0,0,0.96) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[520px]"
      >
        <p className="text-[11px] tracking-[0.18em] mb-3" style={{ color: "var(--ink-warm)" }}>
          在页边留下一行注记
        </p>
        <p className="text-[20px] font-light tracking-[-0.01em] leading-[1.45] mb-5" style={{ color: "var(--text-primary)" }}>
          {prompt ?? "这张牌面上，哪条符号最贴近你此刻的感受？"}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="不需要写完整，一行就好……"
          rows={5}
          className="w-full rounded-2xl px-4 py-3 text-[15px] leading-[1.7] outline-none transition-colors resize-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            backdropFilter: "blur(14px)",
          }}
          autoFocus
        />
        <div className="flex items-center justify-end gap-2 mt-4">
          <button onClick={onSkip} className="action-pill">
            <span>先不写</span>
          </button>
          <button onClick={handleSave} className="coda-action coda-primary">
            <span className="coda-glyph">✓</span>
            <span>留下这一句</span>
          </button>
        </div>
        <p className="text-[11px] tracking-[0.04em] mt-3" style={{ color: "var(--text-faint)" }}>
          只会保存在你的本机浏览器里，不会上传任何地方。
        </p>
      </motion.div>
    </motion.div>
  );
}
