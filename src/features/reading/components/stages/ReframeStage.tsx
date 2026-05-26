"use client";

/**
 * ReframeStage —— 问题复述。
 */

import QuestionReframe from "@/components/QuestionReframe";
import type { QuestionReframe as QuestionReframeData } from "@/lib/schema";

type Props = {
  reframe: QuestionReframeData;
  onAccept: () => void;
  onEdit: () => void;
  onSkip: () => void;
};

export default function ReframeStage({ reframe, onAccept, onEdit, onSkip }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6 py-12">
      <QuestionReframe
        original={reframe.original}
        tension={reframe.tension}
        reframed={reframe.reframed}
        onAccept={onAccept}
        onEdit={onEdit}
        onSkip={onSkip}
      />
    </div>
  );
}
