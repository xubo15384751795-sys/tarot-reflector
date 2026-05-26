/**
 * /notes · 牌面笔记首页
 *
 * 显示所有 ReadingSnapshot，卡片展示：
 * - 时间、模式、问题、抽到的牌、当时写下的感受
 * - 按钮：继续补写 / 打开快照 / 取消固定
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import { CornerOrnament, DividerLine, ArchiveLabel } from "@/components/ArchiveEmblems";
import { useNotes } from "@/features/notes/useNotes";
import { formatRelativeTime, getModeLabel } from "@/features/notes/utils";
import type { ReadingSnapshot } from "@/features/notes/types";
import majorArcana from "@/data/cards/major_arcana.json";
import minorWands from "@/data/cards/minor_wands.json";
import minorCups from "@/data/cards/minor_cups.json";
import minorSwords from "@/data/cards/minor_swords.json";
import minorPentacles from "@/data/cards/minor_pentacles.json";

type IndexedCard = { id: string; image: string };
const ALL_CARDS: IndexedCard[] = [
  ...(majorArcana as IndexedCard[]),
  ...(minorWands as IndexedCard[]),
  ...(minorCups as IndexedCard[]),
  ...(minorSwords as IndexedCard[]),
  ...(minorPentacles as IndexedCard[]),
];

function lookupCardImage(card_id: string): string | null {
  return ALL_CARDS.find((c) => c.id === card_id)?.image ?? null;
}

export default function NotesPage() {
  const router = useRouter();
  const { snapshots, loaded, togglePin, deleteSnapshot, repo } = useNotes();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // 按月份分组
  const grouped = useMemo(() => {
    const buckets = new Map<string, { label: string; items: ReadingSnapshot[] }>();
    for (const snap of snapshots) {
      const d = new Date(snap.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
      if (!buckets.has(key)) buckets.set(key, { label, items: [] });
      buckets.get(key)!.items.push(snap);
    }
    return Array.from(buckets.entries()).map(([key, val]) => ({ key, ...val }));
  }, [snapshots]);

  const totalNotes = repo.getNoteCount();

  return (
    <AppShell showActions={false}>
      <div className="relative min-h-[calc(100vh-60px)]">
        <CornerOrnament size={28} position="tl" className="absolute top-3 left-3 hidden sm:block" style={{ opacity: 0.18 }} />
        <CornerOrnament size={28} position="tr" className="absolute top-3 right-3 hidden sm:block" style={{ opacity: 0.18 }} />
        <CornerOrnament size={28} position="bl" className="absolute bottom-3 left-3 hidden sm:block" style={{ opacity: 0.18 }} />
        <CornerOrnament size={28} position="br" className="absolute bottom-3 right-3 hidden sm:block" style={{ opacity: 0.18 }} />

        <div className="relative z-[1] max-w-[680px] mx-auto px-5 md:px-8 py-10 md:py-14 flex flex-col gap-10">
          {/* Header */}
          <header className="text-center flex flex-col gap-3">
            <div className="flex items-center justify-center gap-3">
              <DividerLine width={32} />
              <ArchiveLabel code="COD.NOTE" />
              <DividerLine width={32} />
            </div>
            <h1
              className="hero-title text-[28px] md:text-[34px] font-light tracking-[-0.012em]"
              style={{ color: "var(--text-primary)" }}
            >
              牌面笔记
            </h1>
            <p
              className="text-[12px] md:text-[13px] tracking-[0.04em] leading-[1.7]"
              style={{ color: "var(--text-tertiary)", maxWidth: "24em", margin: "0 auto" }}
            >
              这里保存的不是答案，而是你曾经如何靠近一个问题。
            </p>
            <p
              className="text-[10.5px] tracking-[0.18em] mt-1"
              style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
            >
              {snapshots.length} 次解读 · {totalNotes} 条笔记 · 只 存 在 你 自 己 的 设 备 上
            </p>
          </header>

          {/* Body */}
          {!loaded ? (
            <div className="flex justify-center py-20">
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{ border: "1px solid var(--border-glass)", borderTopColor: "var(--text-tertiary)" }}
              />
            </div>
          ) : snapshots.length === 0 ? (
            <EmptyState onStart={() => router.push("/")} />
          ) : (
            <div className="flex flex-col gap-10">
              {grouped.map((bucket) => (
                <section key={bucket.key} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="block w-6 h-px" style={{ background: "var(--accent)", opacity: 0.5 }} />
                    <span
                      className="text-[11px] tracking-[0.16em]"
                      style={{ color: "var(--accent)", opacity: 0.8, fontFamily: "var(--font-serif-like)" }}
                    >
                      {bucket.label}
                    </span>
                    <span aria-hidden className="flex-1 h-px" style={{ background: "var(--border-glass)" }} />
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {bucket.items.length} 次
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {bucket.items.map((snap) => (
                      <SnapshotCard
                        key={snap.reading_id}
                        snapshot={snap}
                        repo={repo}
                        confirming={confirmDelete === snap.reading_id}
                        onRequestDelete={() => setConfirmDelete(snap.reading_id)}
                        onCancelDelete={() => setConfirmDelete(null)}
                        onConfirmDelete={() => { deleteSnapshot(snap.reading_id); setConfirmDelete(null); }}
                        onTogglePin={() => togglePin(snap.reading_id)}
                        onOpen={() => router.push(`/notes/${snap.reading_id}`)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SnapshotCard({
  snapshot: snap,
  repo,
  confirming,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onTogglePin,
  onOpen,
}: {
  snapshot: ReadingSnapshot;
  repo: ReturnType<typeof useNotes>["repo"];
  confirming: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onTogglePin: () => void;
  onOpen: () => void;
}) {
  const { relative } = formatRelativeTime(snap.created_at);
  const firstCard = snap.drawn_cards[0];
  const cardImage = firstCard ? lookupCardImage(firstCard.card_id) : null;
  const notes = repo.getNotesForSnapshot(snap.reading_id);
  const latestNote = notes.length > 0 ? notes[notes.length - 1] : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-4 p-5 rounded-2xl cursor-pointer"
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(14px)",
        border: snap.pinned ? "1px solid rgba(214,178,109,0.3)" : "1px solid var(--border-glass)",
        boxShadow: "inset 0 1px 0 rgba(255,247,225,0.05), 0 4px 14px rgba(0,0,0,0.18)",
      }}
      onClick={onOpen}
    >
      {/* 牌缩略 */}
      <div className="shrink-0">
        {cardImage ? (
          <div
            className="relative overflow-hidden rounded-[5px]"
            style={{
              width: 52,
              aspectRatio: "600/1050",
              border: "1px solid rgba(214,178,109,0.28)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
              transform: firstCard?.orientation === "reversed" ? "rotate(180deg)" : undefined,
            }}
          >
            <Image src={cardImage} alt={firstCard?.card_name_zh ?? ""} fill sizes="52px" className="object-cover" />
          </div>
        ) : (
          <div className="rounded-[5px]" style={{ width: 52, aspectRatio: "600/1050", background: "var(--bg-elevated)" }} />
        )}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[11px] tracking-[0.06em] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-tertiary)" }}>
            {getModeLabel(snap.mode)}
          </span>
          {snap.pinned && (
            <span className="text-[10px]" style={{ color: "var(--accent)" }}>📌</span>
          )}
          <span className="text-[10px] ml-auto tracking-[0.04em]" style={{ color: "var(--text-faint)" }}>
            {relative}
          </span>
        </div>

        {snap.question_original && (
          <p className="text-[11.5px] leading-[1.55] italic" style={{ color: "var(--text-tertiary)" }}>
            「{snap.question_original}」
          </p>
        )}

        <div className="flex gap-1.5 flex-wrap">
          {snap.drawn_cards.map((dc) => (
            <span key={dc.card_id} className="text-[10px] tracking-[0.02em]" style={{ color: "var(--text-secondary)" }}>
              {dc.card_name_zh}{dc.orientation === "reversed" ? "(逆)" : ""}
            </span>
          ))}
        </div>

        {latestNote && (
          <p className="text-[13px] leading-[1.65] whitespace-pre-line" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}>
            {latestNote.content.length > 80 ? latestNote.content.slice(0, 80) + "…" : latestNote.content}
          </p>
        )}

        {notes.length > 1 && (
          <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>
            共 {notes.length} 条笔记
          </p>
        )}

        {/* 操作 */}
        <div className="flex justify-end gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onTogglePin}
            className="text-[10px] tracking-[0.04em]"
            style={{ color: snap.pinned ? "var(--accent)" : "var(--text-faint)", background: "transparent", border: "none", cursor: "pointer" }}
          >
            {snap.pinned ? "取消固定" : "固定"}
          </button>
          <AnimatePresence mode="wait" initial={false}>
            {confirming ? (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>确认删除？</span>
                <button onClick={onConfirmDelete} className="text-[10px] underline underline-offset-2" style={{ color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}>删除</button>
                <button onClick={onCancelDelete} className="text-[10px] underline underline-offset-2" style={{ color: "var(--text-faint)", background: "transparent", border: "none", cursor: "pointer" }}>取消</button>
              </motion.div>
            ) : (
              <motion.button key="trash" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} whileHover={{ opacity: 1 }} onClick={onRequestDelete} className="text-[10px] tracking-[0.04em]" style={{ color: "var(--text-faint)", background: "transparent", border: "none", cursor: "pointer" }}>删除</motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <DividerLine width={32} />
      <div>
        <p className="text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)", maxWidth: "20em" }}>
          这里还是空的。
          <br />
          下一次解读结束时，把牌面固定成快照，慢慢回看。
        </p>
      </div>
      <button onClick={onStart} className="hero-cta" style={{ padding: "12px 32px" }}>
        <span className="tracking-[0.12em]">去翻一页档案</span>
      </button>
      <DividerLine width={32} />
    </div>
  );
}
