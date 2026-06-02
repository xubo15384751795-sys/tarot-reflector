/** 连接线在布局容器内的端点（像素，相对 root 左上角） */
export type ConnectorPoints = {
  anchorX: number;
  anchorY: number;
  noteX: number;
  noteY: number;
};

/**
 * 从牌面锚点连到边注内侧边缘的单条贝塞尔路径（Phase 2）。
 * 左侧边注接右缘中点，右侧边注接左缘中点。
 */
export function buildMotifConnectorPath(
  points: ConnectorPoints,
  side: "left" | "right",
): string {
  const { anchorX, anchorY, noteX, noteY } = points;
  const midX = (anchorX + noteX) / 2;
  return `M ${anchorX} ${anchorY} C ${midX} ${anchorY}, ${midX} ${noteY}, ${noteX} ${noteY}`;
}

export function measureMotifConnectorPoints(
  root: HTMLElement,
  motifId: string,
  side: "left" | "right",
): ConnectorPoints | null {
  const rootRect = root.getBoundingClientRect();
  const anchorEl = root.querySelector<HTMLElement>(
    `[data-motif-anchor="${motifId}"]`,
  );
  const noteEl = root.querySelector<HTMLElement>(
    `[data-motif-note="${motifId}"]`,
  );
  if (!anchorEl || !noteEl) return null;

  const a = anchorEl.getBoundingClientRect();
  const n = noteEl.getBoundingClientRect();

  const anchorX = a.left + a.width / 2 - rootRect.left;
  const anchorY = a.top + a.height / 2 - rootRect.top;
  const noteX =
    side === "left"
      ? n.right - rootRect.left
      : n.left - rootRect.left;
  const noteY = n.top + n.height / 2 - rootRect.top;

  return { anchorX, anchorY, noteX, noteY };
}
