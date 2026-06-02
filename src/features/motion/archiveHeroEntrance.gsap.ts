"use client";

import { type RefObject } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ensureGsapPlugins } from "./gsapRegister";

const HERO_ENTRANCE_DURATION = 0.52;

/**
 * Archive hero entrance — scoped to hero ref only (Phase 2B-1).
 * Enable via ARCHIVE_MOTION_FLAGS or ?archiveMotion=heroEntrance.
 */
export function useArchiveHeroEntrance(
  scopeRef: RefObject<HTMLElement | null>,
  options: { enabled: boolean; reducedMotion?: boolean },
): void {
  const { enabled, reducedMotion = false } = options;

  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el) return;

      if (!enabled || reducedMotion) {
        gsap.set(el, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
        return;
      }

      ensureGsapPlugins();
      gsap.from(el, {
        autoAlpha: 0,
        y: 10,
        filter: "blur(6px)",
        duration: HERO_ENTRANCE_DURATION,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    {
      scope: scopeRef,
      dependencies: [enabled, reducedMotion],
      revertOnUpdate: true,
    },
  );
}
