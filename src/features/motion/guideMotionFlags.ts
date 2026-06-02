/**
 * Guide motion — per-flag gates (default all off).
 * Do not use REGRESSION_STATIC_LAYOUT for guide scroll reveal.
 *
 * Dev isolation: ?guideMotion=<flagKey> enables exactly one flag.
 */
export const GUIDE_MOTION_FLAGS = {
  sectionReveal: false,
  railActive: false,
} as const;

export type GuideMotionFlag = keyof typeof GUIDE_MOTION_FLAGS;

export function isGuideMotionFlagEnabled(flag: GuideMotionFlag): boolean {
  if (typeof window !== "undefined") {
    const only = new URLSearchParams(window.location.search).get("guideMotion");
    if (only) {
      return only === flag;
    }
  }
  return GUIDE_MOTION_FLAGS[flag];
}
