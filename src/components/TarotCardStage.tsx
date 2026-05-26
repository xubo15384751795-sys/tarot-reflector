"use client";

/**
 * TarotCardStage — 阴影逻辑
 *
 * 原则：阴影承托牌，不包围牌。在浅色背景上必须避免方形 halo 和"卡片套卡片"
 * 的双层观感。所以这里所有形状性阴影都用 filter: drop-shadow，让阴影
 * 跟随圆角矩形轮廓；只有环境光与地面投影是独立元素，且都是圆形/椭圆，
 * blur 后绝不会出现矩形边。
 *
 * 三层（按从远到近）：
 *   1. 环境光晕 — 圆形 radial-gradient，被 borderRadius:50% 裁成圆，
 *      高斯模糊后是真正的圆形光团，不会显出方形 halo。
 *   2. 地面椭圆 — 牌脚下的接触面，定义"重量"的来源。
 *   3. drop-shadow 栈 — 三段距离/不透明度递减的暖棕投影，
 *      贴着圆角矩形外缘衰减；替代了原本作用在两个 div 上的 box-shadow，
 *      避免方形二次描边。
 */

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 牌面旋转角度，默认 -2.2deg */
  rotate?: number;
  /** 是否显示落地椭圆阴影 */
  showGroundShadow?: boolean;
  /** 自定义 className */
  className?: string;
  /** Framer Motion 动画 props */
  animate?: MotionProps["animate"];
  initial?: MotionProps["initial"];
  transition?: MotionProps["transition"];
}

/** 纸牌物理感 spring — 慢启动 → 轻微加速 → 柔和停住 → 一点点回弹 */
const cardSpring = {
  type: "spring" as const,
  stiffness: 95,
  damping: 18,
  mass: 0.85,
};

export default function TarotCardStage({
  children,
  rotate = -2.2,
  showGroundShadow = true,
  className,
  animate,
  initial,
  transition,
}: Props) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: "100%", maxWidth: 280, aspectRatio: "2 / 3.45" }}
      initial={initial ?? { opacity: 0, y: 24, rotate: rotate - 3, scale: 0.96 }}
      animate={animate ?? { opacity: 1, y: 0, rotate, scale: 1 }}
      transition={transition ?? {
        opacity: { duration: 0.45, ease: "easeOut" },
        y: cardSpring,
        rotate: cardSpring,
        scale: cardSpring,
      }}
    >
      {/* 环境光晕 — 收紧、上提，不再越过牌底，避免和地面阴影叠出"亮带" */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "-12%",
          right: "-12%",
          top: "-14%",
          bottom: "8%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(214,178,109,0.20) 0%, rgba(214,178,109,0.08) 40%, transparent 72%)",
          filter: "blur(22px)",
          zIndex: 0,
        }}
      />

      {/* 地面阴影 — 单层多停顿椭圆 + 一道极薄接触线
          单层是为了消除"两个椭圆边缘各自显形"的暗带；
          接触线只有 2px 高、blur 4，让牌"贴住"地面，但不会形成第二条可见边。 */}
      {showGroundShadow && (
        <>
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              zIndex: 0,
              bottom: -20,
              width: "88%",
              height: 38,
              background:
                "radial-gradient(ellipse at 50% 50%," +
                " rgba(48,32,16,0.32) 0%," +
                " rgba(48,32,16,0.18) 14%," +
                " rgba(48,32,16,0.08) 34%," +
                " rgba(48,32,16,0.025) 58%," +
                " transparent 82%)",
              filter: "blur(14px)",
            }}
          />
          {/* 贴地接触线 — 帮助牌"咬"住地面 */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              zIndex: 0,
              bottom: -1,
              width: "62%",
              height: 3,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(40,26,12,0.28) 20%, rgba(40,26,12,0.32) 50%, rgba(40,26,12,0.28) 80%, transparent 100%)",
              filter: "blur(2.5px)",
            }}
          />
        </>
      )}

      {/* 第三层：drop-shadow 栈 — 跟随圆角矩形轮廓，没有方形二次描边 */}
      <div
        className="relative z-[1] w-full h-full"
        style={{
          filter:
            "drop-shadow(0 1px 1px rgba(60, 42, 22, 0.18)) drop-shadow(0 8px 14px rgba(72, 54, 34, 0.14)) drop-shadow(0 28px 48px rgba(82, 62, 40, 0.10))",
        }}
      >
        {/* 单层卡面 — 薄纸边 + 顶部内高光，不再叠纸质 frame */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: 13,
            border: "1px solid rgba(78, 60, 40, 0.22)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
