"use client";

import { useSyncExternalStore } from "react";

/**
 * Detects prefers-reduced-motion using useSyncExternalStore (React 19 pattern).
 */
function subscribeToMediaQuery(query: string, callback: () => void): () => void {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMediaQuerySnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getMediaQueryServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => subscribeToMediaQuery("(prefers-reduced-motion: reduce)", cb),
    () => getMediaQuerySnapshot("(prefers-reduced-motion: reduce)"),
    getMediaQueryServerSnapshot
  );
}

/**
 * Check if we're on a touch device (mobile).
 * Used to disable cursor glow on mobile.
 */
export function useIsTouchDevice(): boolean {
  return useSyncExternalStore(
    (cb) => subscribeToMediaQuery("(pointer: coarse)", cb),
    () => {
      if (typeof window === "undefined") return false;
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      );
    },
    () => false
  );
}

const subscribeNoop = () => () => {};

/** SSR-safe client mount gate — avoids Framer Motion hydration mismatches. */
export function useClientMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
