"use client";

import Link from "next/link";

/**
 * Matter.js 实验页 — 仅 motion-lab，不进入主流程。
 * 安装 matter-js 后可在此接入牌堆 demo。
 */
export default function MotionLabPhysicsPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <p className="text-[11px] tracking-[0.14em] uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
        Motion Lab · Physics
      </p>
      <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-serif-like)" }}>
        物理实验（非生产）
      </h1>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
        此页仅供研究牌堆碰撞与重量感。正式抽牌、档案库、阅读流程使用 GSAP
        时间轴与 CSS 阴影，不使用 Matter.js。
      </p>
      <Link
        href="/motion-lab"
        className="text-sm underline"
        style={{ color: "var(--accent)" }}
      >
        ← 返回 Motion Lab
      </Link>
    </main>
  );
}
