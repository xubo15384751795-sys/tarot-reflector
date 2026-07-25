/**
 * Archive motion — per-flag gates (default all off).
 * Phase 2A = surface only. Phase 2B = enable one flag at a time (heroEntrance first).
 *
 * Dev / Playwright isolation: ?archiveMotion=<flagKey> enables exactly one flag.
 */
export const ARCHIVE_MOTION_FLAGS = {
  heroEntrance: false,
  groupCardsEntrance: false,
  thumbEntrance: false,
  thumbHover: false,
  cursorGlow: false,
  scrollReveal: false,
} as const;

export type ArchiveMotionFlag = keyof typeof ARCHIVE_MOTION_FLAGS;

export function isArchiveMotionFlagEnabled(flag: ArchiveMotionFlag): boolean {
  if (typeof window !== "undefined") {
    const only = new URLSearchParams(window.location.search).get("archiveMotion");
    if (only) {
      return only === flag;
    }
  }
  return ARCHIVE_MOTION_FLAGS[flag];
}
