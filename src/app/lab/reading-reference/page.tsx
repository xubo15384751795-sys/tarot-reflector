import Image from "next/image";
import { LabShell } from "@/components/lab/LabShell";
import { TarotCardFrame } from "@/components/ui/TarotCardFrame";
import { getReadingReferenceDaily } from "@/lib/karpathyFixtures";

/**
 * Reading entry reference — fixture only, no session / API / motion.
 * Validates: centered card stage, image frame, daily copy shell.
 */
export default function ReadingReferencePage() {
  const fixture = getReadingReferenceDaily();
  const { card } = fixture;

  return (
    <LabShell
      title="Reading Reference"
      subtitle="Layout + Image layer · fixtures/reading_reference_daily.json"
    >
      <div className="reading-entry-page home-page flex flex-col items-center justify-center min-h-[70vh] py-12">
        <p
          className="text-[11px] tracking-[0.14em] mb-6 uppercase"
          style={{ color: "var(--text-faint)" }}
        >
          {fixture.statusLabel}
        </p>

        <div className="hero-shell w-full max-w-md mx-auto flex flex-col items-center text-center gap-6">
          <TarotCardFrame variant="reading" solo className="mx-auto card-stage--reading">
            <Image
              src={card.image}
              alt={card.name_en}
              fill
              sizes="(max-width: 480px) 80vw, 360px"
              className="object-cover"
              priority
            />
          </TarotCardFrame>

          <div className="question-input-shell w-full max-w-sm">
            <h2 className="hero-title text-2xl mb-2">{card.name_zh}</h2>
            <p className="text-[12px] tracking-[0.08em] mb-3" style={{ color: "var(--text-muted)" }}>
              {card.name_en} · {card.orientation === "upright" ? "正位" : "逆位"}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {card.keywords_zh.map((kw) => (
                <span
                  key={kw}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-[14px] leading-[1.75]" style={{ color: "var(--text-tertiary)" }}>
              {card.meaning_zh}
            </p>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
