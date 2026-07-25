/**
 * /motion-lab — 单一 ScrollTrigger master timeline（camera-driven）
 * 所有数值来自 @/motion/motion-tokens
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  blur,
  distance,
  easeGsap,
  opacity,
  opacityRange,
  scale,
  scaleCamera,
  scroll,
  shotProgress,
} from "./motion-tokens";

let scrollPluginReady = false;

function ensureScrollTrigger() {
  if (scrollPluginReady || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  scrollPluginReady = true;
}

export type CinematicRefs = {
  hero: HTMLElement;
  rig: HTMLElement;
  mainVisual: HTMLElement;
  vignette: HTMLElement;
  light: HTMLElement;
  baseDark: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  cards: HTMLElement;
  hint: HTMLElement;
};

const SETTLE = {
  scale: scale.cameraEnd,
  y: distance.camera.mainYTotalMax,
  rotate: 0.21,
  mainScale: 1.042,
  mainX: -Math.round(distance.camera.bookParallaxMax * 0.6),
  titleOpacity: opacityRange.title.end,
  subtitleOpacity: opacityRange.subtitle.max * 0.65,
  vignette: 0.88,
  light: opacityRange.candle.max * 0.875,
  baseDark: 1,
} as const;

function applyReducedMotion(refs: CinematicRefs) {
  const {
    rig,
    mainVisual,
    vignette,
    light,
    baseDark,
    title,
    subtitle,
    cards,
    hint,
  } = refs;

  gsap.set(rig, {
    scale: SETTLE.scale,
    y: SETTLE.y,
    rotate: SETTLE.rotate,
    transformOrigin: "48% 52%",
  });
  gsap.set(mainVisual, {
    rotate: -5,
    x: SETTLE.mainX,
    scale: SETTLE.mainScale,
    transformOrigin: "50% 55%",
  });
  gsap.set(vignette, { opacity: SETTLE.vignette });
  gsap.set(light, { opacity: SETTLE.light, x: 0, y: 0 });
  gsap.set(baseDark, { opacity: SETTLE.baseDark });
  gsap.set(title, { y: 0, opacity: SETTLE.titleOpacity });
  gsap.set(subtitle, { opacity: SETTLE.subtitleOpacity, y: 0 });
  gsap.set(hint, { opacity: 0 });
  gsap.set(cards, {
    opacity: opacity.visible,
    y: 0,
    filter: `blur(${blur.none}px)`,
  });
}

/** 绑定主时间轴；返回 cleanup（kill context + ScrollTrigger） */
export function bindCinematicTimeline(
  refs: CinematicRefs,
  reducedMotion: boolean,
): () => void {
  ensureScrollTrigger();

  const { hero } = refs;

  const ctx = gsap.context(() => {
    const {
      hero: heroEl,
      rig,
      mainVisual,
      vignette,
      light,
      baseDark,
      title,
      subtitle,
      cards,
      hint,
    } = refs;

    if (reducedMotion) {
      applyReducedMotion(refs);
      return;
    }

    const ease = easeGsap.camera;
    const { stillOpeningEnd: p1, cameraPushEnd: p2, archiveEmergenceEnd: p3, settleEnd: p4 } =
      shotProgress;

    const cardEmergenceDur = (p3 - p2) * 1.2;

    // ── 海报静帧初始态（无 JS 时 CSS 亦成立）──
    gsap.set(rig, {
      scale: scale.cameraStart,
      y: 0,
      rotate: -0.7,
      transformOrigin: "48% 52%",
    });
    gsap.set(mainVisual, {
      rotate: -5,
      x: 0,
      scale: 1,
      transformOrigin: "50% 55%",
    });
    gsap.set(vignette, { opacity: 0.82 });
    gsap.set(light, { opacity: opacityRange.candle.min, x: 0, y: 0 });
    gsap.set(baseDark, { opacity: 1 });
    gsap.set(title, { y: 0, opacity: opacityRange.title.start });
    gsap.set(subtitle, { y: 0, opacity: 0 });
    gsap.set(hint, { opacity: 1 });
    gsap.set(cards, {
      opacity: opacity.hidden,
      y: distance.camera.cardEmergenceMax,
      filter: `blur(${blur.medium}px)`,
    });

    const tl = gsap.timeline({
      defaults: { ease },
      scrollTrigger: {
        trigger: heroEl,
        start: "top top",
        end: `+=${scroll.trackVhDefault - 100}%`,
        pin: true,
        scrub: scroll.scrub,
        anticipatePin: 1,
      },
    });

    const seg = (from: number, to: number) => to - from;

    // Scene 01：progress 0–10% 镜头静止；hint 在 push 开始后才消退
    // （配合 loadHoldMs：用户 400ms 内不滚动则画面完全静止）

    // Scene 02：camera push — 运动集中在 rig + mainVisual
    tl.to(hint, { opacity: 0, duration: seg(p1, p1 + 0.06) }, p1);

    tl.to(
      rig,
      {
        scale: scaleCamera.pushEnd,
        y: distance.camera.mainYMax,
        rotate: 0.21,
        duration: seg(p1, p2),
      },
      p1,
    );
    tl.to(
      mainVisual,
      {
        scale: 1.028,
        x: -Math.round(distance.camera.bookParallaxMax * 0.4),
        duration: seg(p1, p2),
      },
      p1,
    );
    tl.to(
      title,
      {
        opacity: opacityRange.title.mid,
        duration: seg(p1, p2),
      },
      p1,
    );
    tl.to(
      vignette,
      { opacity: 0.86, duration: seg(p1, p2) },
      p1,
    );
    tl.to(
      light,
      {
        opacity: 0.11,
        duration: seg(p1, p2),
      },
      p1,
    );

    // Scene 03：archive emergence — 卡片整组从深处浮现（无 stagger）
    tl.to(
      rig,
      {
        scale: scaleCamera.emergenceEnd,
        y: "-6.3vh",
        rotate: -0.42,
        duration: seg(p2, p3),
      },
      p2,
    );
    tl.to(
      mainVisual,
      {
        scale: 1.038,
        x: -distance.camera.bookParallaxMax,
        duration: seg(p2, p3),
      },
      p2,
    );
    tl.to(
      title,
      {
        opacity: opacityRange.title.end,
        duration: seg(p2, p3),
      },
      p2,
    );
    tl.to(
      subtitle,
      {
        opacity: opacityRange.subtitle.max,
        duration: seg(p2, p3),
      },
      p2,
    );
    tl.to(
      light,
      {
        opacity: opacityRange.candle.max,
        duration: seg(p2, p3),
      },
      p2,
    );
    tl.to(
      cards,
      {
        opacity: opacity.visible,
        y: 0,
        filter: `blur(${blur.none}px)`,
        duration: cardEmergenceDur,
      },
      p2 + 0.04,
    );

    // Scene 04：settle — 镜头减速停格
    tl.to(
      rig,
      {
        scale: SETTLE.scale,
        y: SETTLE.y,
        rotate: SETTLE.rotate,
        duration: seg(p3, p4),
      },
      p3,
    );
    tl.to(
      mainVisual,
      {
        scale: SETTLE.mainScale,
        x: SETTLE.mainX,
        duration: seg(p3, p4),
      },
      p3,
    );
    tl.to(
      vignette,
      { opacity: SETTLE.vignette, duration: seg(p3, p4) },
      p3,
    );
    tl.to(
      light,
      {
        opacity: SETTLE.light,
        duration: seg(p3, p4),
      },
      p3,
    );
    tl.to(
      subtitle,
      { opacity: SETTLE.subtitleOpacity, duration: seg(p3, p4) },
      p3,
    );
  }, hero);

  return () => ctx.revert();
}

/** @deprecated Motion QA：尘埃改为静态，不再 infinite drift */
export function bindDustDrift(
  _container: HTMLElement,
  _motes: HTMLElement[],
  _reducedMotion: boolean,
): () => void {
  return () => {};
}
