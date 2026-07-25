"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import "@/features/motion/gsapRegister";
import { useReducedMotion } from "@/features/motion";
import { bindCinematicTimeline, scroll } from "@/motion";
import { CARD_BACK_PATH } from "@/components/CardBackImage";
import "./motion-lab.css";

const ARCHIVE_CARDS = [
  {
    title: "问题解读",
    line: "用一张牌回应当下的疑问",
  },
  {
    title: "今日一牌",
    line: "每日一次的轻量记录",
  },
  {
    title: "深度牌阵",
    line: "三道问题，展开更长的纹路",
  },
] as const;

const DUST_COUNT = 12;

function seedDust(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${12 + ((i * 37) % 76)}%`,
    top: `${8 + ((i * 23) % 42)}%`,
    opacity: 0.1 + (i % 3) * 0.04,
  }));
}

export default function MotionLabPage() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const mainVisualRef = useRef<HTMLDivElement>(null);
  const baseDarkRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const dustMotes = useMemo(
    () => seedDust(reducedMotion ? 10 : DUST_COUNT),
    [reducedMotion],
  );

  useGSAP(
    () => {
      const hero = heroRef.current;
      const rig = rigRef.current;
      const mainVisual = mainVisualRef.current;
      const baseDark = baseDarkRef.current;
      const vignette = vignetteRef.current;
      const light = lightRef.current;
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      const hint = hintRef.current;
      const cards = cardsRef.current;

      if (
        !hero ||
        !rig ||
        !mainVisual ||
        !baseDark ||
        !vignette ||
        !light ||
        !title ||
        !subtitle ||
        !hint ||
        !cards
      ) {
        return;
      }

      const killTimeline = bindCinematicTimeline(
        {
          hero,
          rig,
          mainVisual,
          vignette,
          light,
          baseDark,
          title,
          subtitle,
          cards,
          hint,
        },
        reducedMotion,
      );

      return () => {
        killTimeline();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div
      ref={rootRef}
      className="motion-lab"
      style={
        {
          "--motion-track-vh": scroll.trackVhDefault,
          "--motion-hover-dur": "0.28s",
          "--motion-hover-ease": "cubic-bezier(0.45, 0, 0.55, 1)",
        } as React.CSSProperties
      }
    >
      <div ref={heroRef} className="motion-lab__hero">
        <div ref={baseDarkRef} className="motion-lab__base-dark" aria-hidden />
        <div ref={vignetteRef} className="motion-lab__vignette" aria-hidden />

        <div ref={rigRef} className="motion-lab__camera-rig">
          <div ref={mainVisualRef} className="motion-lab__main-visual">
            <div className="motion-lab__book">
              <Image
                src="/images/stage-open-book.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 920px, 92vw"
                style={{ objectPosition: "50% 72%" }}
              />
            </div>
            <div className="motion-lab__card-on-book">
              <Image
                src={CARD_BACK_PATH}
                alt="塔罗牌背面"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>

          <div ref={grainRef} className="motion-lab__grain" aria-hidden />

          <div ref={dustRef} className="motion-lab__dust" aria-hidden>
            {dustMotes.map((mote) => (
              <span
                key={mote.id}
                className="motion-lab__dust-mote"
                style={{
                  left: mote.left,
                  top: mote.top,
                  opacity: mote.opacity,
                }}
              />
            ))}
          </div>

          <div ref={lightRef} className="motion-lab__light" aria-hidden />

          <div className="motion-lab__title-group">
            <h1 ref={titleRef} className="motion-lab__title">
              档案室
            </h1>
            <p ref={subtitleRef} className="motion-lab__subtitle">
              一页尚未翻开的记录
            </p>
          </div>

          <div ref={cardsRef} className="motion-lab__cards">
            {ARCHIVE_CARDS.map((card) => (
              <div
                key={card.title}
                className="motion-lab__archive-card"
                tabIndex={0}
                role="group"
                aria-label={card.title}
              >
                <span className="motion-lab__archive-card__title">
                  {card.title}
                </span>
                <span className="motion-lab__archive-card__line">{card.line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="motion-lab__frame" aria-hidden />

        {reducedMotion && (
          <p className="motion-lab__reduced-note">已为你暂停镜头运动</p>
        )}

        <div
          ref={hintRef}
          className="motion-lab__scroll-hint"
          style={reducedMotion ? { visibility: "hidden" } : undefined}
          aria-hidden={reducedMotion}
        >
          <span className="motion-lab__scroll-hint__line" aria-hidden />
          <p className="motion-lab__scroll-hint__label">向下</p>
        </div>

        <Link href="/motion-lab/gsap" className="motion-lab__chrome-link">
          GSAP demos →
        </Link>
      </div>
    </div>
  );
}
