import { LabShell } from "@/components/lab/LabShell";
import { ArchiveGroupCard } from "@/components/ui/ArchiveGroupCard";
import { TarotThumbCard } from "@/components/ui/TarotThumbCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getArchiveReference } from "@/lib/karpathyFixtures";

/**
 * Archive layout reference — fixture only, no API / Dexie / GSAP.
 * Validates: archive-page, archive-groups, minor-grid, cards-grid, thumb aspect-ratio.
 */
export default function ArchiveReferencePage() {
  const fixture = getArchiveReference();
  const majorTab = fixture.tabs.find((t) => t.id === "major")!;
  const minorTabs = fixture.tabs.filter((t) => t.id !== "major");

  return (
    <LabShell
      title="Archive Reference"
      subtitle="Layout + Image layer · fixtures/archive_reference.json"
    >
      <div className="archive-page archive-page-main">
        <header className="archive-page-hero archive-hero mb-8">
          <SectionHeader
            title="档案馆"
            subtitle="Reference · Rider–Waite–Smith 静态索引"
            className="archive-page-hero__head"
          />
        </header>

        <section className="archive-groups" aria-label="牌组入口">
          <ArchiveGroupCard
            title={majorTab.label}
            subtitle={`${majorTab.theme} · ${majorTab.desc}`}
            count={majorTab.count}
            active
            className="major-arcana-card major-card archive-glass-card"
          />

          <div className="minor-section">
            <h3 className="minor-section__title">小阿尔卡那 · 四种现实维度</h3>
            <div className="minor-grid" role="group">
              {minorTabs.map((tab) => (
                <ArchiveGroupCard
                  key={tab.id}
                  title={tab.label}
                  subtitle={tab.desc}
                  meta={`${tab.count} · ${tab.element} / ${tab.theme}`}
                  className="minor-grid__card archive-glass-card"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="archive-preview current-browse my-8 text-center">
          <h2 className="archive-preview__heading">当前浏览</h2>
          <p className="archive-preview__caption">{fixture.caption}</p>
        </section>

        <div className="cards-grid">
          {fixture.cards.map((card) => (
            <TarotThumbCard
              key={card.id}
              nameZh={card.name_zh}
              nameEn={card.name_en}
              imageSrc={card.image}
              indexLabel={
                card.number != null ? String(card.number).padStart(2, "0") : undefined
              }
            />
          ))}
        </div>
      </div>
    </LabShell>
  );
}
