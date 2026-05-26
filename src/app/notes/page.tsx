"use client";

/**
 * /notes · 笔记
 *
 * 心理咨询场景里这是最重要的留痕：
 * 解读结束时写下的话 + 当时的牌 + 当时的问题，按时间倒序排列。
 * 一周后回来看，比单次的解读本身更有意义。
 *
 * 数据来源：localStorage["tarot:notes"]，单条结构：
 *   { savedAt, card_id, zh_name, orientation, question, note }
 *
 * MVP 不提供编辑（追加新笔记 + 删除即可），保持笔记是"那个时刻的快照"。
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import { CornerOrnament, DividerLine, ArchiveLabel } from "@/components/ArchiveEmblems";
import majorArcana from "@/data/cards/major_arcana.json";
import minorWands from "@/data/cards/minor_wands.json";
import minorCups from "@/data/cards/minor_cups.json";
import minorSwords from "@/data/cards/minor_swords.json";
import minorPentacles from "@/data/cards/minor_pentacles.json";

type StoredNote = {
  savedAt: string;
  card_id: string;
  zh_name: string;
  orientation: "upright" | "reversed";
  question: string;
  note: string;
};

const STORAGE_KEY = "tarot:notes";

// 整合 78 张牌的图片索引：用于笔记里渲染缩略
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

function formatDate(iso: string): { full: string; relative: string } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);

  const full = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  let relative: string;
  if (diffMins < 1) relative = "刚刚";
  else if (diffMins < 60) relative = `${diffMins} 分钟前`;
  else if (diffHours < 24) relative = `${diffHours} 小时前`;
  else if (diffDays < 7) relative = `${diffDays} 天前`;
  else if (diffDays < 30) relative = `${Math.floor(diffDays / 7)} 周前`;
  else if (diffDays < 365) relative = `${Math.floor(diffDays / 30)} 个月前`;
  else relative = `${Math.floor(diffDays / 365)} 年前`;

  return { full, relative };
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  // 简单的 ?confirm-delete state，避免误删
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  useEffect(() => {
    // 客户端 localStorage 一次性加载，不会引发 cascading renders（无依赖）
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredNote[]) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotes(Array.isArray(parsed) ? parsed : []);
    } catch {
      setNotes([]);
    }
    setLoaded(true);
  }, []);

  const handleDelete = (idx: number) => {
    const next = notes.filter((_, i) => i !== idx);
    setNotes(next);
    setConfirmDeleteIdx(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* silent */
    }
  };

  // 按月份分组（YYYY-MM）便于看时间分布
  const grouped = useMemo(() => {
    const buckets = new Map<string, { label: string; items: Array<{ note: StoredNote; origIdx: number }> }>();
    notes.forEach((n, idx) => {
      const d = new Date(n.savedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
      if (!buckets.has(key)) buckets.set(key, { label, items: [] });
      buckets.get(key)!.items.push({ note: n, origIdx: idx });
    });
    return Array.from(buckets.entries()).map(([key, val]) => ({ key, ...val }));
  }, [notes]);

  return (
    <AppShell showActions={false}>
      <div className="relative min-h-[calc(100vh-60px)]">
        {/* 四角档案纹饰 */}
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
              笔 记
            </h1>
            <p
              className="text-[12px] md:text-[13px] tracking-[0.04em] leading-[1.7]"
              style={{ color: "var(--text-tertiary)", maxWidth: "24em", margin: "0 auto" }}
            >
              你在解读结束时写下的话，会在这里等你。
              <br />
              一周以后回来看，比当时的解读更值得读。
            </p>
            <p
              className="text-[10.5px] tracking-[0.18em] mt-1"
              style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
            >
              共 {notes.length} 条 · 只 存 在 你 自 己 的 设 备 上
            </p>
          </header>

          {/* Body */}
          {!loaded ? (
            <div className="flex justify-center py-20">
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{
                  border: "1px solid var(--border-glass)",
                  borderTopColor: "var(--text-tertiary)",
                }}
              />
            </div>
          ) : notes.length === 0 ? (
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
                      {bucket.items.length} 条
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {bucket.items.map(({ note, origIdx }) => (
                      <NoteCard
                        key={`${note.savedAt}-${origIdx}`}
                        note={note}
                        cardImage={lookupCardImage(note.card_id)}
                        confirming={confirmDeleteIdx === origIdx}
                        onRequestDelete={() => setConfirmDeleteIdx(origIdx)}
                        onCancelDelete={() => setConfirmDeleteIdx(null)}
                        onConfirmDelete={() => handleDelete(origIdx)}
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

function NoteCard({
  note,
  cardImage,
  confirming,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  note: StoredNote;
  cardImage: string | null;
  confirming: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const { full, relative } = formatDate(note.savedAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-4 p-5 rounded-2xl"
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(14px)",
        border: "1px solid var(--border-glass)",
        boxShadow:
          "inset 0 1px 0 rgba(255,247,225,0.05), 0 4px 14px rgba(0,0,0,0.18)",
      }}
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
              transform: note.orientation === "reversed" ? "rotate(180deg)" : undefined,
            }}
          >
            <Image src={cardImage} alt={note.zh_name} fill sizes="52px" className="object-cover" />
          </div>
        ) : (
          <div
            className="rounded-[5px]"
            style={{
              width: 52,
              aspectRatio: "600/1050",
              background: "var(--bg-elevated)",
            }}
          />
        )}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* meta */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="text-[13px]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}
          >
            {note.zh_name}
          </span>
          <span
            className="text-[10px] tracking-[0.06em]"
            style={{ color: note.orientation === "upright" ? "var(--accent)" : "var(--text-tertiary)" }}
          >
            {note.orientation === "upright" ? "正位" : "逆位"}
          </span>
          <span
            className="text-[10px] ml-auto tracking-[0.04em]"
            style={{ color: "var(--text-faint)" }}
            title={full}
          >
            {relative}
          </span>
        </div>

        {/* 当时的问题 */}
        {note.question && (
          <p
            className="text-[11.5px] leading-[1.55] italic"
            style={{ color: "var(--text-tertiary)" }}
          >
            「{note.question}」
          </p>
        )}

        {/* 当时写下的话 */}
        <p
          className="text-[13.5px] leading-[1.75] whitespace-pre-line"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-serif-like)",
          }}
        >
          {note.note}
        </p>

        {/* 删除 */}
        <div className="flex justify-end mt-1">
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
                <button
                  onClick={onConfirmDelete}
                  className="text-[10px] tracking-[0.04em] underline underline-offset-2"
                  style={{
                    color: "var(--accent)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  删除
                </button>
                <button
                  onClick={onCancelDelete}
                  className="text-[10px] tracking-[0.04em] underline underline-offset-2"
                  style={{
                    color: "var(--text-faint)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="trash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                onClick={onRequestDelete}
                className="text-[10px] tracking-[0.04em]"
                style={{
                  color: "var(--text-faint)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                删除
              </motion.button>
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
        <p
          className="text-[15px] leading-[1.85]"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-serif-like)",
            maxWidth: "20em",
          }}
        >
          这里还是空的。
          <br />
          下一次解读结束时，写一句话给将来的自己。
        </p>
      </div>
      <button onClick={onStart} className="hero-cta" style={{ padding: "12px 32px" }}>
        <span className="tracking-[0.12em]">去翻一页档案</span>
      </button>
      <DividerLine width={32} />
    </div>
  );
}
