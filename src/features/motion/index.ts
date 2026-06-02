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
export { staggerHotspots, animateHotspotHover, activateHotspot, resetHotspots } from "./motifHotspot.gsap";
export type { HotspotConfig } from "./motifHotspot.gsap";
export {
  createHandwrittenPath,
  animateHandwrittenLine,
  animateHandwrittenLines,
  eraseHandwrittenLine,
} from "./handwrittenLine.gsap";
export { initLuminousLayer, setupLuminousMotion } from "./luminousLayer";
export type { LuminousLayerConfig } from "./luminousLayer";
export { animateSplitReveal } from "./splitText.gsap";
export type { SplitRevealOptions, SplitRevealResult } from "./splitText.gsap";
export { captureModeFlipState, playModeSelectionFlip } from "./modeFlip.gsap";
export { useMotifStepObserver } from "./useMotifStepObserver";
export { scrambleToText } from "./scrambleText.gsap";
export type { ScrambleTextOptions } from "./scrambleText.gsap";
export {
  captureSpreadFlipState,
  playSpreadSelectionFlip,
} from "./spreadFlip.gsap";
export type { SpreadFlipState } from "./spreadFlip.gsap";
export {
  animateArchiveTabIndicator,
  measureTabIndicator,
} from "./archiveTabBar.gsap";
export type { TabIndicatorMetrics } from "./archiveTabBar.gsap";
