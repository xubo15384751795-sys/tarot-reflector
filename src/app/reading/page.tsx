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
import { AlchemicalRing } from "@/components/ArchiveEmblems";
import { useReadingSession } from "@/features/reading/hooks/useReadingSession";
import { useReadingApi } from "@/features/reading/hooks/useReadingApi";
import { useReadingPageActions } from "@/features/reading/hooks/useReadingPageActions";
import ReadingStageRouter from "@/features/reading/components/ReadingStageRouter";
import ReadingFlowProgress from "@/features/reading/components/ReadingFlowProgress";
import ReadingOverlays from "@/features/reading/components/ReadingOverlays";
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
    question,
    api,
    navigateHome: useCallback(() => router.push("/"), [router]),
  });

  const handleSafetyContinue = useCallback(() => {
    session.goTo(mode === "daily" ? "shuffling" : "question_reframing");
  }, [session, mode]);

  const { stage } = session.state;
  const showActions = stage === "position_readings" || stage === "summary";

  return (
    <AppShell
      onRedraw={showActions ? () => router.push("/") : undefined}
      onShare={showActions ? actions.share : undefined}
      showActions={showActions}
      shareHint={actions.shareHint}
    >
      <div className="relative min-h-[calc(100vh-60px)]">
        <ReadingFlowProgress mode={mode} stage={stage} onJump={session.goTo} />

        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06]"
        >
          <AlchemicalRing size={500} rings={4} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(6px)", y: -6 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
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
              onPickSpread={(id: SpreadId) => session.selectSpread(id)}
              onConfirmSpread={session.confirmSpread}
              onOpenManualSelect={session.openManualSpread}
              onSpreadBack={session.backToReframe}
              onContinueAfterReveal={session.advanceFromCardRevealed}
              onBeginReadings={session.beginPositionReadings}
              onNextPosition={session.nextPosition}
              onRelationshipsNext={session.goSummary}
              onSummary={session.goSummary}
              onReplay={session.replay}
              onWriteNote={actions.openNote}
              onClose={actions.startSoftClose}
              onErrorBack={() => router.push("/")}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        <ReflectionStage
          visible={actions.showNote}
          onSave={actions.saveNote}
          onSkip={actions.closeNote}
        />
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
        <AppShell showActions={false}>
          <main className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
            <div
              className="w-5 h-5 rounded-full animate-spin"
              style={{
                border: "1px solid var(--border-glass)",
                borderTopColor: "var(--text-tertiary)",
              }}
            />
          </main>
        </AppShell>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}
