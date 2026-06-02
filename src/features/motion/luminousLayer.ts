import { gsap } from "gsap";

/**
 * Luminous Layer — 流沙 / 金粉微光层
 *
 * 使用 CSS radial-gradient + 极少量 JS 动画实现。
 * 不使用大量粒子系统，保持性能。
 *
 * CSS 实现（在组件中使用）：
 * ```css
 * .luminous-layer {
 *   position: fixed;
 *   inset: 0;
 *   pointer-events: none;
 *   z-index: 0;
 *   background:
 *     radial-gradient(ellipse 600px 400px at 20% 30%, rgba(185,149,82,var(--dust-opacity, 0.26)), transparent),
 *     radial-gradient(ellipse 400px 300px at 70% 60%, rgba(185,149,82,0.12), transparent),
 *     radial-gradient(ellipse 300px 200px at 50% 80%, rgba(185,149,82,0.08), transparent);
 *   animation: luminous-drift 20s ease-in-out infinite alternate;
 * }
 *
 * @keyframes luminous-drift {
 *   0%   { transform: translate(0, 0) scale(1); }
 *   50%  { transform: translate(20px, -15px) scale(1.02); }
 *   100% { transform: translate(-10px, 10px) scale(0.98); }
 * }
 * ```
 *
 * JS 仅用于 prefers-reduced-motion 检测和停止。
 */

export interface LuminousLayerConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** CSS class name */
  className?: string;
}

/**
 * 初始化微光层（CSS 动画，JS 仅控制开关）
 */
export function initLuminousLayer(
  config: LuminousLayerConfig
): { destroy: () => void } {
  const { container, className = "luminous-layer" } = config;

  const el = document.createElement("div");
  el.className = className;
  el.setAttribute("aria-hidden", "true");
  container.prepend(el);

  return {
    destroy: () => {
      el.remove();
    },
  };
}

/**
 * 根据 prefers-reduced-motion 控制微光层
 */
export function setupLuminousMotion(
  layer: HTMLElement,
  reducedMotion: boolean
): void {
  if (reducedMotion) {
    gsap.set(layer, { animationPlayState: "paused" });
  } else {
    gsap.set(layer, { animationPlayState: "running" });
  }
}
