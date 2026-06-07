/**
 * SavePanel — 解读结束后的保存面板
 *
 * 标题：要不要留下这次解读？
 * 选项：
 *   1. 固定成快照并写笔记
 *   2. 只写一句感受
 *   3. 暂时不保存
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  visible: boolean;
  onSaveSnapshot: (noteText: string) => void;
  onSaveNoteOnly: (noteText: string) => void;
  onSkip: () => void;
};

export default function SavePanel({ visible, onSaveSnapshot, onSaveNoteOnly, onSkip }: Props) {
  const [mode, setMode] = useState<"choose" | "write_snapshot" | "write_note">("choose");
  const [text, setText] = useState("");

  if (!visible) return null;

  const handleSaveSnapshot = () => {
    onSaveSnapshot(text.trim());
    setText("");
    setMode("choose");
  };

  const handleSaveNoteOnly = () => {
    onSaveNoteOnly(text.trim());
    setText("");
    setMode("choose");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="save-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{
          background: "radial-gradient(ellipse at center, rgba(8,8,10,0.86) 0%, rgba(0,0,0,0.96) 100%)",
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
          {mode === "choose" ? (
            <>
              <p className="text-[11px] tracking-[0.18em] mb-3" style={{ color: "var(--ink-warm)" }}>
                解读已完成
              </p>
              <p
                className="text-[length:var(--text-title-md)] font-light tracking-[-0.01em] leading-[1.45] mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                要不要留下这次解读？
              </p>
              <p
                className="text-[13px] leading-[1.7] mb-6"
                style={{ color: "var(--text-tertiary)" }}
              >
                你可以只写一句话，也可以把这次牌面固定成快照，之后再回来慢慢看。
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode("write_snapshot")}
                  className="w-full text-left rounded-2xl px-5 py-4 transition-colors"
                  style={{
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="text-[14px]" style={{ fontFamily: "var(--font-serif-like)" }}>
                    固定成快照并写笔记
                  </span>
                  <span className="block text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    保存完整牌面 + 你的感受，以后可以回看
                  </span>
                </button>

                <button
                  onClick={() => setMode("write_note")}
                  className="w-full text-left rounded-2xl px-5 py-4 transition-colors"
                  style={{
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="text-[14px]" style={{ fontFamily: "var(--font-serif-like)" }}>
                    只写一句感受
                  </span>
                  <span className="block text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    不保存牌面，只留一句话
                  </span>
                </button>

                <button
                  onClick={onSkip}
                  className="w-full text-center rounded-2xl px-5 py-3 transition-colors"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-faint)",
                  }}
                >
                  <span className="text-[12px] tracking-[0.04em]">
                    暂时不保存
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[11px] tracking-[0.18em] mb-3" style={{ color: "var(--ink-warm)" }}>
                {mode === "write_snapshot" ? "固定快照" : "写一句感受"}
              </p>
              <p
                className="text-[18px] font-light tracking-[-0.01em] leading-[1.45] mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                这次解读里，哪一句最像你现在的处境？
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="不需要写完整，一行就好……"
                rows={4}
                className="w-full rounded-2xl px-4 py-3 text-[15px] leading-[1.7] outline-none transition-colors resize-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(14px)",
                }}
                autoFocus
              />
              <div className="flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => { setMode("choose"); setText(""); }}
                  className="action-pill"
                >
                  <span>返回</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={onSkip}
                    className="action-pill"
                  >
                    <span>到这里就好</span>
                  </button>
                  <button
                    onClick={mode === "write_snapshot" ? handleSaveSnapshot : handleSaveNoteOnly}
                    className="coda-action coda-primary"
                  >
                    <span className="coda-glyph">✓</span>
                    <span>{mode === "write_snapshot" ? "保存快照" : "留下这一句"}</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] tracking-[0.04em] mt-3" style={{ color: "var(--text-faint)" }}>
                只会保存在你的本机浏览器里，不会上传任何地方。
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
