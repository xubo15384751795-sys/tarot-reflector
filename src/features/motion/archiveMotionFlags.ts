import { REGRESSION_STATIC_LAYOUT } from "./layoutStatic";

/**
 * Archive motion — per-flag gates (default all off).
 * Phase 2 = surface only. Phase 3 = enable one flag at a time.
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

/** Legacy global off — only group + cursor (postmortem binary test). Never use in prod commits. */
const LEGACY_MOTION_WHEN_STATIC_OFF: ArchiveMotionFlag[] = [
  "groupCardsEntrance",
  "cursorGlow",
];

export function isArchiveMotionFlagEnabled(flag: ArchiveMotionFlag): boolean {
  if (typeof window !== "undefined") {
    const only = new URLSearchParams(window.location.search).get("archiveMotion");
    if (only) {
      return only === flag;
    }
  }
  if (!REGRESSION_STATIC_LAYOUT && LEGACY_MOTION_WHEN_STATIC_OFF.includes(flag)) {
    return true;
  }
  return ARCHIVE_MOTION_FLAGS[flag];
}
