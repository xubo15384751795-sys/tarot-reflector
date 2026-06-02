import Image from "next/image";
import { LabShell } from "@/components/lab/LabShell";
import { MotifHotspot } from "@/components/ui/MotifHotspot";
import { TarotCardFrame } from "@/components/ui/TarotCardFrame";
import { getMotifReferenceMagician } from "@/lib/karpathyFixtures";

/**
 * Motif reference — fixture only, static hotspots, no GSAP / ScrollTrigger.
 * Validates: card frame + anchor positions + image layer.
 */
export default function MotifReferencePage() {
  const fixture = getMotifReferenceMagician();
  const { card, motifs } = fixture;

  return (
    <LabShell
      title="Motif Reference"
      subtitle="Image + anchor layer · fixtures/motif_reference_magician.json"
    >
      <div className="motif-reference flex flex-col items-center gap-8 py-6">
        <div className="text-center">
          <h2 className="hero-title text-xl">{card.name_zh}</h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>
            {card.name_en} · 静态热点（无 GSAP）
          </p>
        </div>

        <TarotCardFrame variant="archive" solo className="motif-archive-card-stage mx-auto">
          <Image
            src={card.image}
            alt={card.name_en}
            fill
            sizes="(max-width: 480px) 80vw, 320px"
            className="object-cover"
            priority
          />
          {motifs.map((motif, i) => (
            <MotifHotspot
              key={motif.id}
              id={motif.id}
              label={motif.label_zh}
              x={motif.anchor.x}
              y={motif.anchor.y}
              active={i === 0}
              readonly
            />
          ))}
        </TarotCardFrame>

        <ul className="w-full max-w-md space-y-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {motifs.map((motif) => (
            <li key={motif.id} className="flex gap-2">
              <span style={{ color: "var(--accent)" }}>·</span>
              <span>
                <strong>{motif.label_zh}</strong> — {motif.meaning_zh}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </LabShell>
  );
}
