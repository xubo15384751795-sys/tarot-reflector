/**
 * /notes/[id] · 快照详情页
 *
 * 展示：
 * - 原问题、系统复述、牌阵总览、抽到的牌
 * - 当时完整解读
 * - 当时写下的感受
 * - 后续补写记录（时间线）
 * - 新增补写输入框
 *
 * 回看提示：现在再看这次牌面，你的感受有变化吗？
 */

"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import { CornerOrnament, DividerLine, ArchiveLabel } from "@/components/ArchiveEmblems";
import { useSnapshotDetail } from "@/features/notes/useNotes";
import { createNote, formatRelativeTime, getModeLabel } from "@/features/notes/utils";
import { REVIEW_PROMPTS } from "@/features/notes/types";
import type { ReflectionNote } from "@/features/notes/types";
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

export default function SnapshotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";
  const { snapshot, notes, loaded, saveNote, deleteNote } = useSnapshotDetail(id);
  const [showWrite, setShowWrite] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<string | null>(null);

  // Deterministic review prompt based on snapshot ID (avoids hydration mismatch)
  const reviewPrompt = useMemo(() => {
    const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return REVIEW_PROMPTS[hash % REVIEW_PROMPTS.length];
  }, [id]);

  const handleSaveFollowUp = () => {
    if (!followUpText.trim()) return;
    const note = createNote({
      snapshot_id: id,
      content: followUpText.trim(),
      type: notes.length === 0 ? "initial" : "follow_up",
    });
    saveNote(note);
    setFollowUpText("");
    setShowWrite(false);
  };

  if (!loaded) {
    return (
      <AppShell showActions={false}>
        <div className="flex justify-center py-20">
          <ReadingStatusIndicator status="archive_browsing" />
        </div>
      </AppShell>
    );
  }

  if (!snapshot) {
    return (
      <AppShell showActions={false}>
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <p style={{ color: "var(--text-tertiary)" }}>找不到这次解读。</p>
          <button onClick={() => router.push("/notes")} className="action-pill">
            <span>返回笔记</span>
          </button>
        </div>
      </AppShell>
    );
  }

  const initialNote = notes.find((n) => n.type === "initial");
  const followUpNotes = notes.filter((n) => n.type !== "initial");

  return (
    <AppShell showActions={false}>
      <div className="relative min-h-[calc(100vh-60px)]">
        <CornerOrnament size={28} position="tl" className="absolute top-3 left-3 hidden sm:block" style={{ opacity: 0.18 }} />
        <CornerOrnament size={28} position="tr" className="absolute top-3 right-3 hidden sm:block" style={{ opacity: 0.18 }} />

        <div className="relative z-[1] max-w-[680px] mx-auto px-5 md:px-8 py-10 md:py-14 flex flex-col gap-8">
          {/* Back */}
          <button onClick={() => router.push("/notes")} className="action-pill self-start">
            <span>← 返回笔记</span>
          </button>

          {/* Header */}
          <header className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ArchiveLabel code="SNAP" />
              <span className="text-[11px] tracking-[0.06em] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-tertiary)" }}>
                {getModeLabel(snapshot.mode)}
              </span>
              <span className="text-[10px] ml-auto" style={{ color: "var(--text-faint)" }}>
                {formatRelativeTime(snapshot.created_at).full}
              </span>
            </div>
          </header>

          {/* 问题 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] tracking-[0.16em]" style={{ color: "var(--accent)", opacity: 0.8 }}>当时的问题</h2>
            <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}>
              「{snapshot.question_original}」
            </p>
            {snapshot.question_reframed && snapshot.question_reframed !== snapshot.question_original && (
              <p className="text-[12px] leading-[1.6] italic" style={{ color: "var(--text-tertiary)" }}>
                系统复述：{snapshot.question_reframed}
              </p>
            )}
          </section>

          <DividerLine width={40} />

          {/* 牌阵 */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[11px] tracking-[0.16em]" style={{ color: "var(--accent)", opacity: 0.8 }}>
              {snapshot.spread_name_zh}
            </h2>
            <div className="flex gap-4 flex-wrap">
              {snapshot.drawn_cards.map((dc) => (
                <div key={dc.card_id} className="flex flex-col items-center gap-2">
                  <div
                    className="relative overflow-hidden rounded-[5px]"
                    style={{
                      width: 80,
                      aspectRatio: "600/1050",
                      border: "1px solid var(--accent-a3)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
                      transform: dc.orientation === "reversed" ? "rotate(180deg)" : undefined,
                    }}
                  >
                    {lookupCardImage(dc.card_id) && (
                      <Image src={lookupCardImage(dc.card_id)!} alt={dc.card_name_zh} fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{dc.card_name_zh}</span>
                  <span className="text-[9px]" style={{ color: dc.orientation === "upright" ? "var(--accent)" : "var(--text-tertiary)" }}>
                    {dc.orientation_zh}
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-faint)" }}>{dc.position_name_zh}</span>
                </div>
              ))}
            </div>
          </section>

          <DividerLine width={40} />

          {/* 解读摘要 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] tracking-[0.16em]" style={{ color: "var(--accent)", opacity: 0.8 }}>当时的解读</h2>
            <p className="text-[14px] leading-[1.75]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}>
              {snapshot.summary_zh}
            </p>
            {snapshot.closing_line_zh && (
              <p className="text-[12px] leading-[1.6] italic" style={{ color: "var(--text-tertiary)" }}>
                {snapshot.closing_line_zh}
              </p>
            )}
          </section>

          <DividerLine width={40} />

          {/* 笔记时间线 */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[11px] tracking-[0.16em]" style={{ color: "var(--accent)", opacity: 0.8 }}>
              感受记录
            </h2>

            {initialNote && (
              <NoteItem
                note={initialNote}
                label="当时的感受"
                onDelete={() => deleteNote(initialNote.note_id)}
                confirming={confirmDeleteNote === initialNote.note_id}
                onRequestDelete={() => setConfirmDeleteNote(initialNote.note_id)}
                onCancelDelete={() => setConfirmDeleteNote(null)}
              />
            )}

            {followUpNotes.map((note) => (
              <NoteItem
                key={note.note_id}
                note={note}
                label="后续补写"
                onDelete={() => deleteNote(note.note_id)}
                confirming={confirmDeleteNote === note.note_id}
                onRequestDelete={() => setConfirmDeleteNote(note.note_id)}
                onCancelDelete={() => setConfirmDeleteNote(null)}
              />
            ))}

            {!initialNote && followUpNotes.length === 0 && (
              <p className="text-[13px] leading-[1.7] italic" style={{ color: "var(--text-faint)" }}>
                还没有留下感受。
              </p>
            )}
          </section>

          {/* 回看提示 + 补写输入 */}
          <section className="flex flex-col gap-4 mt-4">
            <p
              className="text-[15px] leading-[1.7]"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}
            >
              {reviewPrompt.prompt_zh}
            </p>

            {showWrite ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <textarea
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  placeholder="写下此刻的感受……"
                  rows={4}
                  className="w-full rounded-2xl px-4 py-3 text-[15px] leading-[1.7] outline-none transition-colors resize-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setShowWrite(false); setFollowUpText(""); }} className="action-pill">
                    <span>取消</span>
                  </button>
                  <button onClick={handleSaveFollowUp} className="coda-action coda-primary">
                    <span className="coda-glyph">✓</span>
                    <span>留下</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowWrite(true)}
                className="self-start rounded-2xl px-5 py-3 transition-colors"
                style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}
              >
                <span className="text-[13px]" style={{ fontFamily: "var(--font-serif-like)" }}>
                  {notes.length > 0 ? "继续补写" : "写下感受"}
                </span>
              </button>
            )}
          </section>

          {/* 底部 */}
          <div className="flex justify-center mt-8">
            <button onClick={() => router.push("/notes")} className="action-pill">
              <span>返回笔记列表</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function NoteItem({
  note,
  label,
  onDelete,
  confirming,
  onRequestDelete,
  onCancelDelete,
}: {
  note: ReflectionNote;
  label: string;
  onDelete: () => void;
  confirming: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
}) {
  const { full, relative } = formatRelativeTime(note.created_at);

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)" }}>
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] tracking-[0.06em]" style={{ color: "var(--text-faint)" }}>{label}</span>
        <span className="text-[10px] ml-auto" style={{ color: "var(--text-faint)" }} title={full}>{relative}</span>
      </div>
      <p className="text-[14px] leading-[1.75] whitespace-pre-line" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}>
        {note.content}
      </p>
      <div className="flex justify-end">
        <AnimatePresence mode="wait" initial={false}>
          {confirming ? (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>确认删除？</span>
              <button onClick={onDelete} className="text-[10px] underline underline-offset-2" style={{ color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}>删除</button>
              <button onClick={onCancelDelete} className="text-[10px] underline underline-offset-2" style={{ color: "var(--text-faint)", background: "transparent", border: "none", cursor: "pointer" }}>取消</button>
            </motion.div>
          ) : (
            <motion.button key="trash" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} whileHover={{ opacity: 1 }} onClick={onRequestDelete} className="text-[10px]" style={{ color: "var(--text-faint)", background: "transparent", border: "none", cursor: "pointer" }}>删除</motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
