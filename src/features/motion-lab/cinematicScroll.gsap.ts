import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinematicMotion } from "./motion-tokens";

let scrollRegistered = false;

function ensureScrollTrigger() {
  if (scrollRegistered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  scrollRegistered = true;
}

export type CinematicRefs = {
  viewport: HTMLElement;
  rig: HTMLElement;
  candle: HTMLElement;
  slip: HTMLElement;
  captions: HTMLElement[];
  hint: HTMLElement;
  book?: HTMLElement | null;
};

export type CinematicBinding = {
  kill: () => void;
};

/** 绑定 camera-rig 主轴 ScrollTrigger（唯一 transform 动画源） */
export function bindCinematicScroll(
  refs: CinematicRefs,
  reducedMotion: boolean,
): CinematicBinding {
  ensureScrollTrigger();

  const { rig, candle, slip, captions, hint, viewport, book } = refs;
  const { shots, reducedMotionFrame: rm } = cinematicMotion;

  const setCaption = (index: number, opacity: number) => {
    captions.forEach((el, i) => {
      gsap.set(el, { opacity: i === index ? opacity : 0 });
    });
  };

  if (reducedMotion) {
    gsap.set(rig, {
      scale: rm.scale,
      x: rm.x,
      y: rm.y,
      rotate: rm.rotate,
    });
    gsap.set(candle, { opacity: rm.candle });
    gsap.set(slip, { opacity: rm.slipOpacity });
    gsap.set(hint, { opacity: 0 });
    setCaption(2, rm.captionOpacity);
    return { kill: () => {} };
  }

  gsap.set(rig, {
    scale: shots.establishing.scale,
    x: shots.establishing.x,
    y: shots.establishing.y,
    rotate: shots.establishing.rotate,
    transformOrigin: "50% 45%",
  });
  gsap.set(candle, { opacity: shots.establishing.candle });
  gsap.set(slip, { opacity: 0 });
  setCaption(0, shots.establishing.captionOpacity);
  gsap.set(hint, { opacity: 1 });

  const ease = cinematicMotion.scrollEase;
  const dur = (a: number, b: number) => b - a;

  const tl = gsap.timeline({
    defaults: { ease },
    scrollTrigger: {
      trigger: viewport,
      start: "top top",
      end: `+=${cinematicMotion.scrollTrackVh * 100}%`,
      pin: true,
      scrub: cinematicMotion.scrub,
      anticipatePin: 1,
    },
  });

  tl.to(hint, { opacity: 0, duration: dur(0, 0.1) }, 0);

  // Shot 01 → 02 approach
  tl.to(
    rig,
    {
      scale: shots.approachEnd.scale,
      x: shots.approachEnd.x,
      y: shots.approachEnd.y,
      rotate: shots.approachEnd.rotate,
      duration: dur(shots.approach.progress, shots.approachEnd.progress),
    },
    shots.approach.progress,
  );
  tl.to(
    candle,
    {
      opacity: shots.approachEnd.candle,
      duration: dur(shots.approach.progress, shots.approachEnd.progress),
    },
    shots.approach.progress,
  );
  tl.to(
    captions[0],
    { opacity: 0, duration: 0.04 },
    shots.approach.progress + 0.14,
  );
  tl.to(
    captions[1],
    { opacity: shots.approachEnd.captionOpacity, duration: 0.06 },
    shots.approach.progress + 0.16,
  );

  // Shot 03 desk
  tl.to(
    rig,
    {
      scale: shots.desk.scale,
      x: shots.desk.x,
      y: shots.desk.y,
      rotate: shots.desk.rotate,
      duration: dur(shots.approachEnd.progress, shots.desk.progress),
    },
    shots.approachEnd.progress,
  );
  tl.to(
    candle,
    {
      opacity: shots.desk.candle,
      duration: dur(shots.approachEnd.progress, shots.desk.progress),
    },
    shots.approachEnd.progress,
  );
  tl.to(
    slip,
    {
      opacity: shots.desk.slipOpacity ?? 0.85,
      duration: dur(shots.approachEnd.progress, shots.desk.progress),
    },
    shots.approachEnd.progress,
  );
  tl.to(captions[1], { opacity: 0, duration: 0.04 }, shots.approachEnd.progress + 0.14);
  tl.to(
    captions[2],
    { opacity: shots.desk.captionOpacity, duration: 0.06 },
    shots.approachEnd.progress + 0.16,
  );

  if (book) {
    tl.to(
      book,
      {
        x: -cinematicMotion.parallax.bookMaxPx * 0.4,
        duration: dur(shots.approachEnd.progress, shots.desk.progress),
      },
      shots.approachEnd.progress,
    );
  }

  // Shot 04 card
  tl.to(
    rig,
    {
      scale: shots.card.scale,
      x: shots.card.x,
      y: shots.card.y,
      rotate: shots.card.rotate,
      duration: dur(shots.desk.progress, shots.card.progress),
    },
    shots.desk.progress,
  );
  tl.to(
    candle,
    {
      opacity: shots.card.candle,
      duration: dur(shots.desk.progress, shots.card.progress),
    },
    shots.desk.progress,
  );
  tl.to(captions[2], { opacity: 0, duration: 0.04 }, shots.desk.progress + 0.14);
  tl.to(
    captions[3],
    { opacity: shots.card.captionOpacity, duration: 0.06 },
    shots.desk.progress + 0.16,
  );

  if (book) {
    tl.to(
      book,
      {
        x: -cinematicMotion.parallax.bookMaxPx,
        duration: dur(shots.desk.progress, shots.card.progress),
      },
      shots.desk.progress,
    );
  }

  // Shot 05 archive
  tl.to(
    rig,
    {
      scale: shots.archive.scale,
      x: shots.archive.x,
      y: shots.archive.y,
      rotate: shots.archive.rotate,
      duration: dur(shots.card.progress, shots.archive.progress),
    },
    shots.card.progress,
  );
  tl.to(
    candle,
    {
      opacity: shots.archive.candle,
      duration: dur(shots.card.progress, shots.archive.progress),
    },
    shots.card.progress,
  );
  tl.to(
    slip,
    {
      opacity: shots.archive.slipOpacity ?? 0.7,
      duration: dur(shots.card.progress, shots.archive.progress),
    },
    shots.card.progress,
  );
  tl.to(captions[3], { opacity: 0, duration: 0.04 }, shots.card.progress + 0.1);
  tl.to(
    captions[4],
    { opacity: shots.archive.captionOpacity, duration: 0.06 },
    shots.card.progress + 0.12,
  );

  // Shot 06 hold
  tl.to(
    rig,
    {
      scale: shots.rest.scale,
      x: shots.rest.x,
      y: shots.rest.y,
      duration: dur(shots.archive.progress, shots.rest.progress),
    },
    shots.archive.progress,
  );

  return {
    kill: () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    },
  };
}
