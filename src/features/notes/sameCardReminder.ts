/**
 * 同牌提醒工具
 *
 * 如果用户抽到之前保存过的 card_id，返回相关快照。
 * 不说"命运再次提醒"，不神秘化。
 */

import type { NotesRepository, ReadingSnapshot } from "./types";

export type SameCardReminder = {
  hasPrevious: boolean;
  snapshots: ReadingSnapshot[];
  message: string;
};

export function checkSameCard(
  repo: NotesRepository,
  cardIds: string[],
): SameCardReminder {
  const matchingSnapshots: ReadingSnapshot[] = [];

  for (const cardId of cardIds) {
    const snaps = repo.getSnapshotsForCard(cardId);
    for (const snap of snaps) {
      if (!matchingSnapshots.some((s) => s.reading_id === snap.reading_id)) {
        matchingSnapshots.push(snap);
      }
    }
  }

  if (matchingSnapshots.length === 0) {
    return { hasPrevious: false, snapshots: [], message: "" };
  }

  const count = matchingSnapshots.length;
  const message =
    count === 1
      ? "这张牌曾经出现在你的记录里。要回看那次吗？"
      : `这张牌在你的记录里出现过 ${count} 次。要回看吗？`;

  return {
    hasPrevious: true,
    snapshots: matchingSnapshots,
    message,
  };
}
