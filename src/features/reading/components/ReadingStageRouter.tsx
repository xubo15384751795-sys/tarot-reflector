"use client";

/**
 * 根据 session.stage 渲染对应的 Stage 组件。
 *
 * 主页面只需关心：把 session 和 callbacks 喂进来，剩下的展示由 router 决定。
 */

import SafetyExit from "@/components/SafetyExit";
import type { ReadingMode, SpreadId } from "@/lib/schema";
import type { ReadingSessionState } from "../types/reading";
import ReframeStage from "./stages/ReframeStage";
import SpreadStage from "./stages/SpreadStage";
import DrawingStage from "./stages/DrawingStage";
import ReadingStage from "./stages/ReadingStage";
import ErrorStage from "./stages/ErrorStage";
import RuminationPauseStage from "./stages/RuminationPauseStage";
import { countRecentReadingsForQuestion } from "../lib/ruminationCheck";

type Props = {
  session: ReadingSessionState;
  mode: ReadingMode;
  domain: string;
  onSafetyContinue: () => void;
  onSafetyBack: () => void;
  onReframeAccept: () => void;
  onReframeEdit: () => void;
  onReframeSkip: () => void;
  /** 反刍护栏：用户决定无视提醒继续抽牌 */
  onRuminationContinue: () => void;
  /** 反刍护栏：用户决定先停一下，回首页 */
  onRuminationPause: () => void;
  onPickSpread: (id: SpreadId) => void;
  onConfirmSpread: () => void;
  onOpenManualSelect: () => void;
  onSpreadBack: () => void;
  onContinueAfterReveal: () => void;
  onBeginReadings: () => void;
  onNextPosition: () => void;
  onRelationshipsNext: () => void;
  onSummary: () => void;
  onReplay: () => void;
  onWriteNote: () => void;
  onClose: () => void;
  onErrorBack: () => void;
};

export default function ReadingStageRouter(props: Props) {
  const { session } = props;
  const { stage } = session;

  if (stage === "safety_exit") {
    return (
      <SafetyExit
        question={session.input.question}
        onContinueAnyway={props.onSafetyContinue}
        onBack={props.onSafetyBack}
      />
    );
  }

  if (stage === "error") {
    return <ErrorStage message={session.errorMessage} onBack={props.onErrorBack} />;
  }

  if (stage === "rumination_pause") {
    const count = countRecentReadingsForQuestion(session.input.question);
    return (
      <RuminationPauseStage
        count={count}
        onPause={props.onRuminationPause}
        onContinue={props.onRuminationContinue}
      />
    );
  }

  if (stage === "question_reframing") {
    if (!session.reframe) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div
            className="w-5 h-5 rounded-full animate-spin"
            style={{
              border: "1px solid var(--border-glass)",
              borderTopColor: "var(--text-tertiary)",
            }}
          />
        </div>
      );
    }
    return (
      <ReframeStage
        reframe={session.reframe}
        onAccept={props.onReframeAccept}
        onEdit={props.onReframeEdit}
        onSkip={props.onReframeSkip}
      />
    );
  }

  if (stage === "spread_recommending" || stage === "spread_select") {
    return (
      <SpreadStage
        stage={stage}
        spreadRec={session.spreadRec}
        selectedSpread={session.selectedSpread}
        onPickSpread={props.onPickSpread}
        onConfirmSpread={props.onConfirmSpread}
        onOpenManualSelect={props.onOpenManualSelect}
        onBack={props.onSpreadBack}
      />
    );
  }

  if (stage === "shuffling" || stage === "card_revealed") {
    return (
      <DrawingStage
        stage={stage}
        drawnCards={session.drawn?.drawn_cards ?? null}
        localMeanings={session.localMeanings}
        onContinue={props.onContinueAfterReveal}
      />
    );
  }

  if (
    stage === "spread_overview" ||
    stage === "position_readings" ||
    stage === "relationships" ||
    stage === "summary"
  ) {
    if (!session.script) return null;
    return (
      <ReadingStage
        stage={stage}
        script={session.script}
        currentPosition={session.currentPosition}
        domain={props.domain}
        aiPending={session.aiPending}
        onBeginReadings={props.onBeginReadings}
        onNextPosition={props.onNextPosition}
        onRelationshipsNext={props.onRelationshipsNext}
        onSummary={props.onSummary}
        onReplay={props.onReplay}
        onWriteNote={props.onWriteNote}
        onClose={props.onClose}
      />
    );
  }

  return null;
}
