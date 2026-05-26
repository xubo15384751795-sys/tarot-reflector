import type { Motif } from "@/lib/schema";

/** 档案库使用的稳定 motif 视图 */
export type ArchiveMotif = {
  id: string;
  label_zh: string;
  meaning_zh: string;
  /** RWS 传统注释（更长一段） */
  traditional_note_zh: string;
  anchor: { x: number; y: number };
  /** 牌面柔和高亮（归一化 0–1） */
  highlight: { x: number; y: number; w: number; h: number; shape: "rect" | "oval" };
  /** 浮动注释卡位置偏好（auto 时由组件根据 anchor.x 自决） */
  popoverSide: "left" | "right" | "top" | "bottom" | "auto";
  /** 坐标精确度（默认 precise） */
  precision: "precise" | "approximate";
  /** 旧字段，向后兼容 */
  note: { side: "left" | "right"; order: number };
  /** 在原始 motifs[] 中的索引 */
  index: number;
};

function anchorFromBbox(m: Motif): { x: number; y: number } {
  if (m.anchor) return m.anchor;
  return {
    x: m.bbox.x + m.bbox.w / 2,
    y: m.bbox.y + m.bbox.h / 2,
  };
}

function sideFromMotif(m: Motif, anchor: { x: number; y: number }): "left" | "right" {
  return m.note?.side ?? (anchor.x < 0.5 ? "left" : "right");
}

/** 将任意 Motif 规范化为档案库可用的稳定结构 */
export function normalizeArchiveMotif(m: Motif, index: number): ArchiveMotif {
  const anchor = anchorFromBbox(m);
  const side = sideFromMotif(m, anchor);
  const highlight = m.highlight
    ? {
        x: m.highlight.x,
        y: m.highlight.y,
        w: m.highlight.w,
        h: m.highlight.h,
        shape: m.highlight.shape ?? "rect",
      }
    : { x: m.bbox.x, y: m.bbox.y, w: m.bbox.w, h: m.bbox.h, shape: "rect" as const };

  return {
    id: m.id,
    label_zh: m.label_zh ?? m.label,
    meaning_zh: m.meaning_zh ?? m.meaning,
    traditional_note_zh: m.traditional_note_zh ?? m.meaning_zh ?? m.meaning,
    anchor,
    highlight,
    popoverSide: m.popover?.side ?? "auto",
    precision: m.precision ?? "precise",
    note: {
      side,
      order: m.note?.order ?? 0,
    },
    index,
  };
}

function assignOrders(items: ArchiveMotif[], motifs: Motif[]): ArchiveMotif[] {
  const withExplicit = items.filter((m) => m.note.order > 0);
  const without = items.filter((m) => m.note.order <= 0);

  if (without.length === 0) {
    return [...withExplicit].sort((a, b) => a.note.order - b.note.order);
  }

  // 旧数据 fallback：按 note.y 或 anchor.y 排序后分配 order
  const sorted = [...without].sort((a, b) => {
    const ya = motifs[a.index]?.note?.y ?? a.anchor.y;
    const yb = motifs[b.index]?.note?.y ?? b.anchor.y;
    return ya - yb;
  });

  let nextOrder =
    withExplicit.length > 0
      ? Math.max(...withExplicit.map((m) => m.note.order)) + 1
      : 1;

  const assigned = sorted.map((m) => ({
    ...m,
    note: { ...m.note, order: nextOrder++ },
  }));

  return [...withExplicit, ...assigned].sort((a, b) => a.note.order - b.note.order);
}

export function partitionArchiveMotifs(motifs: Motif[]): {
  all: ArchiveMotif[];
  left: ArchiveMotif[];
  right: ArchiveMotif[];
} {
  const raw = motifs.map(normalizeArchiveMotif);
  const leftRaw = raw.filter((m) => m.note.side === "left");
  const rightRaw = raw.filter((m) => m.note.side === "right");

  const left = assignOrders(leftRaw, motifs);
  const right = assignOrders(rightRaw, motifs);

  return { all: raw, left, right };
}
