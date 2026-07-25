// Motion System — Public API
import "./gsapRegister";

export { ensureGsapPlugins, CARD_LAND_EASE } from "./gsapRegister";
export {
  motionTokens,
  gsapEase,
  duration,
  stagger,
  motionColors,
  springCard,
  springSmall,
  springSnappy,
  easeSoft,
  easeGentle,
  pageTransition,
} from "./motionTokens";
export {
  createTarotRevealTimeline,
  createCardRevealTimeline,
} from "./tarotRevealTimeline";
export type {
  TarotRevealTargets,
  TarotRevealOptions,
  CardRevealOptions,
} from "./tarotRevealTimeline";
export { animateDrawSVG, eraseDrawSVG } from "./drawSvg.gsap";
export { animateMotifConnector, hideMotifConnector } from "./motifConnector.gsap";
export { useReducedMotion, useIsTouchDevice, useClientMounted } from "./useReducedMotion";
export { preloadImage, preloadImages } from "./preloadImage";
export { useCursorGlow, useCursorGlowOnScope } from "./useCursorGlow";
export {
  bindGuideSectionReveals,
  bindGuideAmbientScroll,
} from "./guideScrollReveal.gsap";
// ScrollTrigger registered via gsapRegister side-effect import in guideScrollReveal
export type { GuideRevealCleanup } from "./guideScrollReveal.gsap";
export { showMotifHighlight, hideMotifHighlight } from "./motifHighlight.gsap";
export {
  staggerHotspots,
  animateHotspotHover,
  activateHotspot,
  resetHotspots,
} from "./motifHotspotTimeline";
export type { HotspotConfig } from "./motifHotspotTimeline";
export {
  createHandwrittenPath,
  animateHandwrittenLine,
  animateHandwrittenLines,
  eraseHandwrittenLine,
} from "./handwrittenLine";
export { initLuminousLayer, setupLuminousMotion } from "./luminousLayer";
export type { LuminousLayerConfig } from "./luminousLayer";
export { animateSplitReveal } from "./splitText.gsap";
export type { SplitRevealOptions, SplitRevealResult } from "./splitText.gsap";
export { useMotifStepObserver } from "./useMotifStepObserver";
export { scrambleToText } from "./scrambleText.gsap";
export type { ScrambleTextOptions } from "./scrambleText.gsap";
export {
  ARCHIVE_MOTION_FLAGS,
  isArchiveMotionFlagEnabled,
} from "./archiveMotionFlags";
export type { ArchiveMotionFlag } from "./archiveMotionFlags";
export {
  animateArchiveTabIndicator,
  measureTabIndicator,
} from "./archiveTabBar.gsap";
export type { TabIndicatorMetrics } from "./archiveTabBar.gsap";
