"use client";

/**
 * 极淡的金粉 / 烛光漂浮层。
 *
 * - 纯 CSS：多层 radial-gradient + transform 漂移
 * - 不使用 JS 粒子，不影响文字可读性
 * - prefers-reduced-motion 时漂移自动停止
 *
 * 用法：放在 position: relative 的容器内最底层。
 */
type Props = {
  /** 'low' 多用于浅色页面或卡片内部；'medium' 用于全屏暗色页面 */
  intensity?: "low" | "medium";
};

export default function LuminousLayer({ intensity = "medium" }: Props) {
  return (
    <div aria-hidden className={`luminous luminous--${intensity}`}>
      <div className="luminous__layer luminous__layer--a" />
      <div className="luminous__layer luminous__layer--b" />
    </div>
  );
}
