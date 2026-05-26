"use client";

/**
 * ReflectionStage —— 留下注记的浮层（覆盖在主流程之上）。
 *
 * 注意：这是一个 overlay，使用方负责挂在 <AnimatePresence> 下并通过 visible 控制。
 */

import ReflectionNote from "@/components/ReflectionNote";

type Props = {
  visible: boolean;
  onSave: (text: string) => void;
  onSkip: () => void;
};

export default function ReflectionStage({ visible, onSave, onSkip }: Props) {
  if (!visible) return null;
  return (
    <ReflectionNote
      prompt="这张牌面上，哪条符号最贴近你此刻的感受？"
      onSave={onSave}
      onSkip={onSkip}
    />
  );
}
