"use client";

/**
 * CardDeck — 升级版抽牌动画
 *
 * 节奏（约 1.6s 总长）：
 *   0.0s  暖金halo 渐现 + 5 张牌叠出
 *   0.2s  halo 开始呼吸式脉冲（infinite，到结束才停）
 *   0.3s  5 张牌扇形展开到 ~22° 弧线，stagger 60ms
 *   0.75s 扇形整体微旋（绕中心 ~6°），又轻轻晃回
 *   1.1s  扇形以 spring 收回，5 张牌叠回中心
 *   1.45s 最上面那张做一次斜向光带 sweep（::before 仿玻璃光感）
 *   1.6s  onShuffleComplete 触发
 *
 * 视觉点缀：
 *   - 卡牌后方一组飘动星点（4 颗），低饱和度暖色
 *   - 牌底椭圆阴影随脉冲缩放
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useClientMounted } from "@/features/motion";
import { readingStatusText } from "@/lib/readingStatusCopy";
import CardBackImage from "./CardBackImage";

type Props = {
  isShuffling: boolean;
  onShuffleComplete: () => void;
  /** 当前阶段提示文字 */
  statusText?: string;
};

const STACK_COUNT = 5;
// 每张牌在最终扇形里的旋转角（度），中心 0、左右对称
const FAN_ROTATIONS = [-22, -11, 0, 11, 22];
const FAN_TRANSLATE_X = [-60, -30, 0, 30, 60];
const FAN_TRANSLATE_Y = [10, 3, 0, 3, 10];

export default function CardDeck({
  isShuffling,
  onShuffleComplete,
  statusText,
}: Props) {
  const mounted = useClientMounted();
  const [phase, setPhase] = useState<"idle" | "stack" | "fan" | "swirl" | "collapse" | "sheen">(
    "idle"
  );

  useEffect(() => {
    // 这里 setPhase 是这个 effect 唯一作用，且依赖项不含 phase，
    // 不会发生 cascading renders。后续 setPhase 也都从 setTimeout 回调里发起
    // （react-hooks/set-state-in-effect 推荐的"外部源 callback"模式）。
    if (!isShuffling) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("idle");
      return;
    }
    setPhase("stack");
    const t1 = setTimeout(() => setPhase("fan"), 300);
    const t2 = setTimeout(() => setPhase("swirl"), 750);
    const t3 = setTimeout(() => setPhase("collapse"), 1100);
    const t4 = setTimeout(() => setPhase("sheen"), 1450);
    const t5 = setTimeout(() => onShuffleComplete(), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isShuffling, onShuffleComplete]);

  const label = statusText ?? readingStatusText("shuffling");

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] relative">
        {isShuffling && (
          <div className="flex flex-col items-center gap-3 mt-10">
            <p
              className="text-[13px] tracking-[0.08em]"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}
            >
              {label}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[340px] relative">
      <AnimatePresence>
        {isShuffling && (
          <motion.div
            key="shuffle-container"
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "16rem", height: "18rem" }}
          >
            {/* 暖金 halo · 呼吸脉冲 */}
            <motion.div
              aria-hidden
              className="absolute pointer-events-none rounded-full"
              style={{
                inset: "8%",
                background:
                  "radial-gradient(circle at 50% 55%, rgba(214,178,109,0.28) 0%, rgba(214,178,109,0.08) 40%, transparent 72%)",
                filter: "blur(18px)",
              }}
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* 飘浮星点 · 4 颗，绕牌堆缓动 */}
            {[0, 1, 2, 3].map((i) => {
              const angle = (i / 4) * Math.PI * 2;
              const r = 110 + (i % 2) * 18;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r * 0.6;
              return (
                <motion.span
                  key={`mote-${i}`}
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: 3,
                    height: 3,
                    background: "rgba(255, 247, 220, 0.85)",
                    boxShadow: "0 0 8px rgba(214,178,109,0.6)",
                  }}
                  initial={{ x, y, opacity: 0 }}
                  animate={{
                    x: [x, x * 1.08, x * 0.92, x],
                    y: [y, y - 6, y + 6, y],
                    opacity: [0, 0.9, 0.9, 0],
                  }}
                  transition={{
                    duration: 2.4,
                    delay: 0.15 + i * 0.18,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}

            {/* 牌底椭圆阴影，跟随 halo 呼吸 */}
            <motion.div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                bottom: 18,
                left: "50%",
                width: 140,
                height: 18,
                marginLeft: -70,
                borderRadius: 999,
                background:
                  "radial-gradient(ellipse at center, rgba(40,26,12,0.32) 0%, rgba(40,26,12,0.10) 55%, transparent 80%)",
                filter: "blur(10px)",
              }}
              animate={{ scaleX: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* 5 张牌叠层 · 扇形展开 / 收回 */}
            <div
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                width: 144,
                height: 200,
                marginLeft: -72,
                marginTop: -100,
              }}
            >
              {Array.from({ length: STACK_COUNT }).map((_, i) => {
                const center = (STACK_COUNT - 1) / 2;
                const offset = i - center;
                // 各阶段的目标变换
                const target =
                  phase === "stack"
                    ? { x: offset * 1.5, y: -offset * 0.4, rotate: offset * 0.6 }
                    : phase === "fan"
                    ? {
                        x: FAN_TRANSLATE_X[i],
                        y: FAN_TRANSLATE_Y[i],
                        rotate: FAN_ROTATIONS[i],
                      }
                    : phase === "swirl"
                    ? {
                        x: FAN_TRANSLATE_X[i] * 0.9,
                        y: FAN_TRANSLATE_Y[i] + 4,
                        rotate: FAN_ROTATIONS[i] + 5,
                      }
                    : { x: offset * 1, y: -offset * 0.3, rotate: offset * 0.3 };

                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-[14px] overflow-hidden"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.94 }}
                    animate={{
                      ...target,
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      x: { type: "spring", stiffness: 140, damping: 22, mass: 0.7 },
                      y: { type: "spring", stiffness: 140, damping: 22, mass: 0.7 },
                      rotate: { type: "spring", stiffness: 130, damping: 20 },
                      opacity: { duration: 0.4, delay: i * 0.06 },
                      scale: { duration: 0.4, delay: i * 0.06 },
                    }}
                    style={{
                      zIndex: i === STACK_COUNT - 1 ? 10 : i,
                      boxShadow:
                        "0 14px 28px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.18)",
                      transformOrigin: "50% 95%",
                    }}
                  >
                    <CardBackImage eager={i === STACK_COUNT - 1} />
                    {/* 最上面那张：sheen 阶段斜向光带 sweep */}
                    {i === STACK_COUNT - 1 && phase === "sheen" && (
                      <motion.div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        initial={{ x: "-130%" }}
                        animate={{ x: "130%" }}
                        transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                        style={{
                          background:
                            "linear-gradient(115deg, transparent 30%, rgba(255,252,232,0.55) 50%, transparent 70%)",
                          transform: "skewX(-18deg)",
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isShuffling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-3 mt-10"
        >
          <p
            className="text-[13px] tracking-[0.08em]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}
          >
            {label}
          </p>
          {/* 进度点 · 也跟着脉冲 */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.22,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
