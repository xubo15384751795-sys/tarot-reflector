"use client";

import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import AppGuideContent from "@/components/AppGuideContent";

export default function GuidePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <AppGuideContent />
      </Suspense>
    </AppShell>
  );
}
