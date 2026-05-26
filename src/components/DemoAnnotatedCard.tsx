"use client";

/**
 * DemoAnnotatedCard — 短视频拍摄专用的标注牌面
 *
 * 与 AnnotatedCard 的区别：
 *   - 同时只高亮一个 motif（短视频节奏一次讲一个）
 *   - 用一条曲线箭头从画面外侧指向 motif 的 bbox 中心
 *   - bbox 用一个柔和发光的圆角矩形罩住，强调"看这里"
 *   - 没有内置的标签栏；标签 + meaning 由父组件在画面下方大字渲染
 */

import { AnimatePresence, motion } from "framer-motion";
import type { Motif, Orientation } from "@/lib/schema";
import CardImage from "./CardImage";

type Props = {
  image: string;
  cardName: string;
  zhName: string;
  orientation: Orientation;
  motifs: Motif[];
  activeIdx: number | null;
};

export default function DemoAnnotatedCard({
  image,
  cardName,
  zhName,
  orientation,
  motifs,
  activeIdx,
}: Props) {
  const active = activeIdx != null ? motifs[activeIdx] ?? null : null;
  const isReversed = orientation === "reversed";

  // motif bbox 在牌面上的归一化位置（考虑逆位翻转）
  const activeRect = active
    ? (() => {
        const bx = isReversed ? 1 - active.bbox.x - active.bbox.w : active.bbox.x;
        const by = isReversed ? 1 - active.bbox.y - active.bbox.h : active.bbox.y;
        return {
          left: bx,
          top: by,
          width: active.bbox.w,
          height: active.bbox.h,
          cx: bx + active.bbox.w / 2,
          cy: by + active.bbox.h / 2,
        };
      })()
    : null;

  // 箭头放在 motif 重心相对画面更远的那一侧——避免线穿过牌脸的关键内容
  const arrowSide: "left" | "right" = activeRect && activeRect.cx > 0.5 ? "left" : "right";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 牌面容器：用 aspect-ratio 锁住塔罗牌比例 600:1050 */}
      <div
        className="relative h-full max-h-full"
        style={{ aspectRatio: "600 / 1050" }}
      >
        {/* 外侧暖金光晕 */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: "-8% -12%",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(206, 185, 138, 0.20) 0%, rgba(206, 185, 138, 0.05) 45%, rgba(0,0,0,0) 75%)",
            filter: "blur(10px)",
          }}
        />

        {/* 牌面图 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: 18,
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
          }}
        >
          <CardImage
            image={image}
            cardName={cardName}
            zhName={zhName}
            orientation={orientation}
            eager
          />
        </div>

        {/* 当 motif active 时，把非 motif 区域稍微压暗，把注意力推向 bbox */}
        <AnimatePresence>
          {activeRect && (
            <motion.div
              key={`dim-${activeIdx}`}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 18,
                background: "rgba(8, 6, 4, 0.32)",
                mask: `radial-gradient(ellipse ${activeRect.width * 130}% ${
                  activeRect.height * 130
                }% at ${activeRect.cx * 100}% ${activeRect.cy * 100}%, transparent 30%, black 80%)`,
                WebkitMask: `radial-gradient(ellipse ${activeRect.width * 130}% ${
                  activeRect.height * 130
                }% at ${activeRect.cx * 100}% ${activeRect.cy * 100}%, transparent 30%, black 80%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* 高亮框：圆角矩形 + 发光描边 */}
        <AnimatePresence mode="popLayout">
          {activeRect && (
            <motion.div
              key={`box-${activeIdx}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="absolute pointer-events-none"
              style={{
                left: `${activeRect.left * 100}%`,
                top: `${activeRect.top * 100}%`,
                width: `${activeRect.width * 100}%`,
                height: `${activeRect.height * 100}%`,
                borderRadius: 12,
                border: "1.5px solid rgba(214, 178, 109, 0.95)",
                boxShadow:
                  "0 0 0 1px rgba(214, 178, 109, 0.35), 0 0 24px rgba(214, 178, 109, 0.55), inset 0 0 18px rgba(214, 178, 109, 0.18)",
              }}
            />
          )}
        </AnimatePresence>

        {/* 箭头 + label 锚点：用一个绝对定位的 SVG 覆盖在牌面上 */}
        <AnimatePresence mode="popLayout">
          {activeRect && active && (
            <ArrowAnnotation
              key={`arr-${activeIdx}`}
              side={arrowSide}
              targetX={activeRect.cx}
              targetY={activeRect.cy}
              label={active.label}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * SVG arrow + label：箭头根据 motif 在牌左半/右半，从牌外侧 30% 处弧线指过来。
 * SVG 用 0..100 的 viewBox 覆盖整个牌面，方便用百分比坐标对齐。
 */
function ArrowAnnotation({
  side,
  targetX,
  targetY,
  label,
}: {
  side: "left" | "right";
  targetX: number;
  targetY: number;
  label: string;
}) {
  // 箭头起点：在牌的外侧 -30% 处（伸到牌外），y 和 target 错开一点形成弧度
  const sx = side === "right" ? 1.28 : -0.28;
  const sy = targetY < 0.5 ? Math.min(targetY + 0.18, 0.45) : Math.max(targetY - 0.18, 0.55);
  // 终点：留 5% 间距，不要戳进高亮框中央
  const offset = 0.04;
  const tx =
    targetX + (side === "right" ? -1 : 1) * (offset + 0); // 略偏内侧
  const ty = targetY;
  // 控制点：让曲线先朝牌外延伸再勾回 target
  const c1x = side === "right" ? 0.96 : 0.04;
  const c1y = sy;
  const c2x = targetX + (side === "right" ? 0.12 : -0.12);
  const c2y = targetY;

  const path = `M ${sx * 100} ${sy * 100} C ${c1x * 100} ${c1y * 100}, ${c2x * 100} ${
    c2y * 100
  }, ${tx * 100} ${ty * 100}`;

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <defs>
        <marker
          id={`demo-arrow-head-${side}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(214, 178, 109, 0.95)" />
        </marker>
      </defs>
      <motion.path
        d={path}
        stroke="rgba(214, 178, 109, 0.9)"
        strokeWidth="0.55"
        strokeLinecap="round"
        fill="none"
        markerEnd={`url(#demo-arrow-head-${side})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ filter: "drop-shadow(0 0 4px rgba(214,178,109,0.5))" }}
        vectorEffect="non-scaling-stroke"
      />
      {/* 箭头起点的小圆点 + label 文本（label 用 HTML 覆盖，更易控制字体） */}
      <foreignObject
        x={side === "right" ? "100" : "-32"}
        y={`${sy * 100 - 4}`}
        width="32"
        height="14"
        style={{ overflow: "visible" }}
      >
        <div
          style={{
            color: "rgba(214, 178, 109, 0.95)",
            fontSize: 2.2,
            letterSpacing: "0.04em",
            fontWeight: 300,
            textAlign: side === "right" ? "left" : "right",
            lineHeight: 1.2,
            paddingLeft: side === "right" ? 1.5 : 0,
            paddingRight: side === "right" ? 0 : 1.5,
            whiteSpace: "nowrap",
            transform: "translateY(-1px)",
            textShadow: "0 0 3px rgba(8,6,4,0.8)",
          }}
        >
          {label}
        </div>
      </foreignObject>
    </motion.svg>
  );
}
