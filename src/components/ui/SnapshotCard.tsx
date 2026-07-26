"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { easeSoft } from "@/features/motion";
import { NoteCard } from "./NoteCard";
import { cn } from "./cn";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  thumbnail?: ReactNode;
  pinned?: boolean;
  className?: string;
  onOpen?: () => void;
  onTogglePin?: () => void;
  onRequestDelete?: () => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  confirming?: boolean;
  noteCount?: number;
};

/** 解读快照列表卡片 — /notes 统一容器 */
export function SnapshotCard({
  title,
  subtitle,
  meta,
  thumbnail,
  pinned = false,
  className,
  onOpen,
  onTogglePin,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  confirming = false,
  noteCount,
}: Props) {
  const actions = (
    <div className="flex flex-col items-end gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
      {onTogglePin && (
        <button
          type="button"
          onClick={onTogglePin}
          className={`snapshot-card__pin-toggle${pinned ? " is-pinned" : ""}`}
        >
          {pinned ? "取消固定" : "固定"}
        </button>
      )}
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
              确认删除？
            </span>
            {onConfirmDelete && (
              <button
                type="button"
                onClick={onConfirmDelete}
                className="text-[10px] underline underline-offset-2 bg-transparent border-none cursor-pointer"
                style={{ color: "var(--accent)" }}
              >
                删除
              </button>
            )}
            {onCancelDelete && (
              <button
                type="button"
                onClick={onCancelDelete}
                className="text-[10px] underline underline-offset-2 bg-transparent border-none cursor-pointer"
                style={{ color: "var(--text-faint)" }}
              >
                取消
              </button>
            )}
          </motion.div>
        ) : (
          onRequestDelete && (
            /* 删除是破坏性操作，不该和「固定」抢同样的视觉份额，
               也不该一直挂在标题旁边等着被误点。默认隐去，
               指针悬停或键盘聚焦到卡片时才出现（.note-card 上的
               :hover / :focus-within 控制），颜色用 --danger 表明意图。 */
            <button
              key="trash"
              type="button"
              onClick={onRequestDelete}
              className="snapshot-card__delete"
            >
              删除
            </button>
          )
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeSoft }}
      className={cn(className)}
    >
      <NoteCard
        title={title}
        subtitle={subtitle}
        meta={meta}
        thumbnail={thumbnail}
        pinned={pinned}
        onClick={onOpen}
        actions={actions}
        noteCount={noteCount}
      />
    </motion.div>
  );
}
