import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsapEase } from "./motionTokens";
import { ensureGsapPlugins } from "./gsapRegister";

let scrollTriggerReady = false;

function ensureScrollTrigger(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  ensureGsapPlugins();
  if (!scrollTriggerReady) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerReady = true;
  }
  return true;
}

export type GuideRevealCleanup = () => void;

/**
 * 科普导览章节浮现 — ScrollTrigger once，内部 stagger。
 */
export function bindGuideSectionReveals(
  root: HTMLElement,
  options?: { reducedMotion?: boolean; mobile?: boolean },
): GuideRevealCleanup {
  const reduced = options?.reducedMotion ?? false;
  const mobile = options?.mobile ?? false;

  if (!ensureScrollTrigger()) {
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      gsap.set(el, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
    });
    return () => {};
  }
  const sections = gsap.utils.toArray<HTMLElement>(
    root.querySelectorAll(".guide-section"),
  );

  if (reduced || sections.length === 0) {
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      gsap.set(el, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
    });
    return () => {};
  }

  const triggers: ScrollTrigger[] = [];

  sections.forEach((section) => {
    const targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    const tween = gsap.from(targets, {
      autoAlpha: 0,
      y: mobile ? 18 : 28,
      filter: "blur(8px)",
      duration: mobile ? 0.58 : 0.72,
      ease: gsapEase.soft,
      stagger: mobile ? 0.06 : 0.08,
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
    });

    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  return () => {
    triggers.forEach((t) => t.kill());
  };
}

/** 背景微光随滚动轻微位移 */
export function bindGuideAmbientScroll(
  glowEl: HTMLElement | null,
  options?: { reducedMotion?: boolean },
): GuideRevealCleanup {
  if (!glowEl || options?.reducedMotion || !ensureScrollTrigger()) return () => {};

  const tween = gsap.to(glowEl, {
    y: 48,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
