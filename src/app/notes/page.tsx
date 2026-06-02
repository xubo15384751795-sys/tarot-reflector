"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppShell from "@/components/AppShell";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import { DividerLine, ArchiveLabel } from "@/components/ArchiveEmblems";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SnapshotCard } from "@/components/ui/SnapshotCard";
import { StatusPill } from "@/components/ui/StatusPill";
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
      <div className="relative min-h-[calc(100vh-60px)]" style={{ background: "var(--bg-base)" }}>
        <div className="relative z-[1] max-w-[680px] mx-auto px-5 md:px-8 py-10 md:py-14 flex flex-col gap-10">
          <header className="text-center flex flex-col gap-3">
            <div className="flex items-center justify-center gap-3">
              <DividerLine width={32} />
              <ArchiveLabel code="COD.NOTE" />
              <DividerLine width={32} />
            </div>
            <SectionHeader
              title="牌面笔记"
              subtitle="这里保存的不是答案，而是你曾经如何靠近一个问题。"
            />
            <StatusPill variant="muted">
              {snapshots.length} 次解读 · {totalNotes} 条笔记 · 只存在你的设备上
            </StatusPill>
          </header>

          {!loaded ? (
            <div className="flex justify-center py-20">
              <ReadingStatusIndicator status="archive_browsing" />
            </div>
          ) : snapshots.length === 0 ? (
            <EmptyState onStart={() => router.push("/")} />
          ) : (
            <div className="flex flex-col gap-10">
              {grouped.map((bucket) => (
                <section key={bucket.key} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="block w-6 h-px" style={{ background: "var(--accent)", opacity: 0.5 }} />
                    <span className="text-[11px] tracking-[0.16em]" style={{ color: "var(--accent)", opacity: 0.8, fontFamily: "var(--font-serif-like)" }}>
                      {bucket.label}
                    </span>
                    <span aria-hidden className="flex-1 h-px" style={{ background: "var(--border-glass)" }} />
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {bucket.items.length} 次
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {bucket.items.map((snap) => {
                      const { relative } = formatRelativeTime(snap.created_at);
                      const firstCard = snap.drawn_cards[0];
                      const cardImage = firstCard ? lookupCardImage(firstCard.card_id) : null;
                      const notes = repo.getNotesForSnapshot(snap.reading_id);
                      const latestNote = notes.length > 0 ? notes[notes.length - 1] : null;
                      const cardLine = snap.drawn_cards
                        .map((dc) => `${dc.card_name_zh}${dc.orientation === "reversed" ? "(逆)" : ""}`)
                        .join(" · ");

                      return (
                        <SnapshotCard
                          key={snap.reading_id}
                          meta={`${getModeLabel(snap.mode)} · ${relative}`}
                          title={snap.question_original || snap.summary_zh}
                          subtitle={
                            latestNote
                              ? latestNote.content.length > 80
                                ? latestNote.content.slice(0, 80) + "…"
                                : latestNote.content
                              : cardLine
                          }
                          pinned={snap.pinned}
                          noteCount={notes.length}
                          confirming={confirmDelete === snap.reading_id}
                          onOpen={() => router.push(`/notes/${snap.reading_id}`)}
                          onTogglePin={() => togglePin(snap.reading_id)}
                          onRequestDelete={() => setConfirmDelete(snap.reading_id)}
                          onCancelDelete={() => setConfirmDelete(null)}
                          onConfirmDelete={() => {
                            deleteSnapshot(snap.reading_id);
                            setConfirmDelete(null);
                          }}
                          thumbnail={
                            cardImage ? (
                              <div
                                className="relative overflow-hidden rounded-[5px]"
                                style={{
                                  width: 52,
                                  aspectRatio: "600/1050",
                                  border: "1px solid var(--border-active)",
                                  transform: firstCard?.orientation === "reversed" ? "rotate(180deg)" : undefined,
                                }}
                              >
                                <Image
                                  src={cardImage}
                                  alt={firstCard?.card_name_zh ?? ""}
                                  fill
                                  sizes="52px"
                                  className="object-cover"
                                />
                              </div>
                            ) : undefined
                          }
                        />
                      );
                    })}
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

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <DividerLine width={32} />
      <p className="text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)", maxWidth: "20em" }}>
        这里还是空的。
        <br />
        下一次解读结束时，把牌面固定成快照，慢慢回看。
      </p>
      <button type="button" onClick={onStart} className="hero-cta" style={{ padding: "12px 32px" }}>
        <span className="tracking-[0.12em]">去翻一页档案</span>
      </button>
      <DividerLine width={32} />
    </div>
  );
}
