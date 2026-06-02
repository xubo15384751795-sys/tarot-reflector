"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { Observer } from "gsap/Observer";
import "./gsapRegister";

type Handlers = {
  onPrev: () => void;
  onNext: () => void;
};

/**
 * 科普/录屏舞台：上下或左右滑动手势切换 motif。
 */
export function useMotifStepObserver(
  targetRef: RefObject<HTMLElement | null>,
  handlers: Handlers,
  enabled: boolean,
): void {
  const handlersRef = useRef(handlers);

  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useGSAP(
    () => {
      const target = targetRef.current;
      if (!enabled || !target) return;

      const obs = Observer.create({
        target,
        type: "touch,pointer",
        tolerance: 36,
        preventDefault: true,
        onUp: () => handlersRef.current.onPrev(),
        onDown: () => handlersRef.current.onNext(),
        onLeft: () => handlersRef.current.onNext(),
        onRight: () => handlersRef.current.onPrev(),
      });

      return () => {
        obs.kill();
      };
    },
    { scope: targetRef, dependencies: [enabled], revertOnUpdate: true },
  );
}
