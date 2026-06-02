"use client";

import type { ReactNode } from "react";

/** 牌阵页主内容区；规则说明已移至全局侧栏「阈牌指南」。 */
export default function SpreadStageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="spread-stage-layout w-full max-w-[640px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <main className="spread-stage-main flex flex-col items-center justify-center min-h-[50vh]">
        {children}
      </main>
    </div>
  );
}
