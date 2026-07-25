/**
 * 解读页（Reading）—— 现在只是一层薄壳。
 *
 *   useReadingSession      管核心状态机
 *   useReadingApi          管 /api/reading/* IO
 *   useReadingPageActions  管页面级浮层（注记/分享/演示/软关闭）
 *   ReadingStageRouter     根据 session.stage 渲染对应阶段
 *
 * 复杂逻辑请前往 src/features/reading/。
 */

"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import SavePanel from "@/components/SavePanel";
import { useReadingSession } from "@/features/reading/hooks/useReadingSession";
import { useReadingApi } from "@/features/reading/hooks/useReadingApi";
import { useReadingPageActions } from "@/features/reading/hooks/useReadingPageActions";
import ReadingStageRouter from "@/features/reading/components/ReadingStageRouter";
import ReadingFlowProgress from "@/features/reading/components/ReadingFlowProgress";
import ReadingOverlays from "@/features/reading/components/ReadingOverlays";
import { pageTransition } from "@/features/motion";
import ReflectionStage from "@/features/reading/components/stages/ReflectionStage";
import type { Domain, ReadingMode, SpreadId } from "@/lib/schema";

function ReadingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = (params.get("mode") ?? "daily") as ReadingMode;
  const question = params.get("question") ?? "";
  const domain = (params.get("domain") ?? "self") as Domain;
  const context = params.get("context") ?? undefined;

  const session = useReadingSession({ mode, question, domain, context });
  const api = useReadingApi();
  const actions = useReadingPageActions({
    script: session.state.script,
    drawn: session.state.drawn,
    question,
    reframe: session.state.reframe?.reframed ?? null,
    domain,
    mode,
    api,
    navigateHome: useCallback(() => router.push("/"), [router]),
  });

  const handleSafetyContinue = useCallback(() => {
    session.goTo(mode === "daily" ? "shuffling" : "question_reframing");
  }, [session, mode]);

  const { stage } = session.state;
  // 「重新抽牌」只在牌已经出来之后露出
  const canRedraw = stage === "position_readings" || stage === "summary";
  // 分享按钮仅 summary 阶段露出，避免在用户还在读的过程中诱导社交分享
  const canShare = stage === "summary";

  /**
   * position_readings / relationships / summary 是同一份滚动文档的三段，
   * 必须共用一个 AnimatePresence key —— 否则用户滚到收束时整块会被
   * 卸载重建，滚动位置和 sticky 牌面一起被打回顶部。
   */
  const transitionKey =
    stage === "position_readings" ||
    stage === "relationships" ||
    stage === "summary"
      ? "reading-scroll"
      : stage;

  return (
    <AppShell
      onRedraw={canRedraw ? () => router.push("/") : undefined}
      onShare={canShare ? actions.share : undefined}
      shareHint={actions.shareHint}
    >
      <div className="relative min-h-[calc(100vh-60px)]">
        <ReadingFlowProgress mode={mode} stage={stage} onJump={session.goTo} />

        <AnimatePresence mode="wait">
          <motion.div
            key={transitionKey}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
            className="relative z-[1]"
          >
            <ReadingStageRouter
              session={session.state}
              mode={mode}
              domain={domain}
              onSafetyContinue={handleSafetyContinue}
              onSafetyBack={() => router.push("/")}
              onReframeAccept={session.acceptReframe}
              onReframeEdit={() => router.push("/")}
              onReframeSkip={session.skipReframe}
              onRuminationPause={() => router.push("/")}
              onRuminationContinue={session.overrideRumination}
              onPickSpread={(id: SpreadId) => session.selectSpread(id)}
              onConfirmSpread={session.confirmSpread}
              onOpenManualSelect={session.openManualSpread}
              onSpreadBack={session.backToReframe}
              onContinueAfterReveal={session.advanceFromCardRevealed}
              onBeginReadings={session.beginPositionReadings}
              onFocusPosition={session.focusPosition}
              onSummary={session.goSummary}
              onReplay={session.replay}
              onWriteNote={actions.openSavePanel}
              onClose={actions.startSoftClose}
              onErrorBack={() => router.push("/")}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 保存面板 */}
      <AnimatePresence>
        {actions.showSavePanel && (
          <SavePanel
            visible={actions.showSavePanel}
            onSaveSnapshot={actions.saveSnapshotWithNote}
            onSaveNoteOnly={actions.saveNoteOnly}
            onSkip={actions.closeSavePanel}
          />
        )}
      </AnimatePresence>

      {/* 旧版笔记浮层（保留兼容） */}
      <AnimatePresence>
        <ReflectionStage
          visible={actions.showNote}
          onSave={actions.saveNote}
          onSkip={actions.closeNote}
        />
      </AnimatePresence>

      {/* 同牌提醒 */}
      <AnimatePresence>
        {actions.sameCardReminder && (
          <motion.div
            key="same-card-reminder"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[400px] w-[calc(100%-2rem)] rounded-2xl px-5 py-4"
            style={{
              background: "var(--bg-glass)",
              backdropFilter: "blur(14px)",
              border: "1px solid var(--accent-a3)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}>
              {actions.sameCardReminder.message}
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={actions.dismissSameCardReminder} className="action-pill">
                <span>不用了</span>
              </button>
              <button
                onClick={() => { router.push(`/notes/${actions.sameCardReminder!.snapshots[0].reading_id}`); actions.dismissSameCardReminder(); }}
                className="coda-action coda-primary"
              >
                <span>回看</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReadingOverlays
        noteSaved={actions.noteSaved}
        softClose={actions.softClose}
        demoMode={actions.demoMode}
        videoScript={actions.videoScript}
        script={session.state.script}
        onCloseDemo={actions.closeDemo}
      />
    </AppShell>
  );
}

export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <main className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
            <ReadingStatusIndicator status="question_reframing" />
          </main>
        </AppShell>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}
