/**
 * Guide motion — per-flag gates (default all off).
 * Guide scroll reveal 只受 GUIDE_MOTION_FLAGS 控制，不要再引入全局总开关。
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
