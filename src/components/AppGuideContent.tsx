"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  bindGuideSectionReveals,
  useReducedMotion,
} from "@/features/motion";
import {
  SPREAD_CATALOG,
  getSpreadGuideBundle,
} from "@/lib/appGuide";
import { ARCHIVE_GUIDE_CHAPTERS } from "@/lib/archiveGuideChapters";

function difficultyLabel(d: string): string {
  if (d === "beginner") return "入门";
  if (d === "intermediate") return "进阶";
  return "深入";
}

const GUIDE_SECTIONS = ARCHIVE_GUIDE_CHAPTERS.map((ch) => ({
  id: `section-${ch.number}`,
  chapterId: ch.id,
  index: ch.number,
  arch: ch.arch,
  title: ch.title,
  lead: ch.lead,
  body: ch.body,
  hint: ch.hint,
}));

const APPENDIX_SECTION = {
  id: "section-spreads",
  chapterId: "spreads",
  index: "附",
  arch: "ARCH.+",
  title: "牌阵一览",
  lead: "点击名称，在下方查看牌位与连读规则。",
} as const;

export default function AppGuideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusSpreadId = searchParams.get("spread");
  const spreadBundle = getSpreadGuideBundle(focusSpreadId);

  const [activeSectionId, setActiveSectionId] = useState(GUIDE_SECTIONS[0].id);
  const [kicker, setKicker] = useState(GUIDE_SECTIONS[0].arch);
  const reducedMotion = useReducedMotion();

  const setFocusSpread = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("spread", id);
      else params.delete("spread");
      const q = params.toString();
      router.replace(q ? `/guide?${q}` : "/guide", { scroll: false });
    },
    [router, searchParams],
  );

  const scrollToSection = useCallback((sectionDomId: string) => {
    document.getElementById(sectionDomId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      ".guide-content .guide-section[data-section-id]",
    );
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit?.target) return;
        const sid = hit.target.getAttribute("data-section-id");
        const arch = hit.target.getAttribute("data-arch");
        if (sid) setActiveSectionId(sid);
        if (arch) setKicker(arch);
      },
      { rootMargin: "-18% 0px -52% 0px", threshold: [0, 0.2, 0.45] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const root = document.querySelector(".guide-content");
    if (!(root instanceof HTMLElement)) return;
    return bindGuideSectionReveals(root, { reducedMotion });
  }, [reducedMotion]);

  const railSections = [
    ...GUIDE_SECTIONS.map((s) => ({
      id: s.id,
      index: s.index,
      title: s.title,
    })),
    { id: APPENDIX_SECTION.id, index: "+", title: APPENDIX_SECTION.title },
  ];

  return (
    <main className="guide-page">
      <section className="guide-hero">
        <SectionHeader
          kicker={kicker || "ARCH.02"}
          title="科普"
          subtitle="塔罗、牌阵与使用方式"
        />
      </section>

      <div className="guide-shell">
        <aside className="guide-rail" aria-label="章节导航">
          {railSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSectionId === section.id ? "active" : undefined}
              aria-label={section.title}
              /* 「+」（牌阵附录）光看是猜不出的；aria-label 只服务读屏，
                 补一个原生 tooltip 给用眼睛的人 */
              title={section.title}
              aria-current={activeSectionId === section.id ? "true" : undefined}
              onClick={() => scrollToSection(section.id)}
            >
              {section.index}
            </button>
          ))}
        </aside>

        <div className="guide-content">
          {GUIDE_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              data-section-id={section.id}
              data-arch={section.arch}
              className={`guide-section${
                activeSectionId === section.id ? " is-active" : ""
              }`}
            >
              {/* 这里原本每一章都套一个 GlassCard。八个带边带影的大方块摞
                  在一起，读起来就是「说明书目录」—— AGENTS.md 明确禁止
                  （「禁止后台表格、说明书目录」「禁止三栏文档布局作为默认」），
                  UI_CONVENTIONS 也写了「不要 panel 套 card」。而且同一页
                  底部的牌阵附录本来就没套卡，八章套、一章不套。
                  改成和解读页同一套编辑语言：渐变竖脊 + 手稿页码，不加框。 */}
              <span className="guide-section__spine" aria-hidden />
              <div className="guide-section-index" data-reveal>{section.index}</div>
              <h2 className="guide-section-title" data-reveal>{section.title}</h2>
              <p className="guide-section-lead" data-reveal>{section.lead}</p>
              {section.body.map((paragraph, i) => (
                <p key={`${section.id}-body-${i}`} className="guide-section-body" data-reveal>
                  {paragraph}
                </p>
              ))}
              {section.hint ? (
                <p className="guide-section-tip" data-reveal>{section.hint}</p>
              ) : null}
            </section>
          ))}

          <section
            id={APPENDIX_SECTION.id}
            data-section-id={APPENDIX_SECTION.id}
            data-arch={APPENDIX_SECTION.arch}
            className={`guide-section guide-section--spreads${
              activeSectionId === APPENDIX_SECTION.id ? " is-active" : ""
            }`}
          >
            <span className="guide-section__spine" aria-hidden />
            <div className="guide-section-index">{APPENDIX_SECTION.index}</div>
            <h2 className="guide-section-title">{APPENDIX_SECTION.title}</h2>
            <p className="guide-section-lead">{APPENDIX_SECTION.lead}</p>

            <ul className="guide-spread-pick">
              {SPREAD_CATALOG.map((s) => {
                const active = focusSpreadId === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`guide-spread-pick__btn ${active ? "is-active" : ""}`}
                      onClick={() => setFocusSpread(active ? null : s.id)}
                    >
                      <span className="guide-spread-pick__name">{s.name_zh}</span>
                      <span className="guide-spread-pick__meta">
                        {s.card_count} 张 · {difficultyLabel(s.difficulty)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {spreadBundle ? (
              <div className="guide-spread-detail">
                {spreadBundle.difficultyHint ? (
                  <p className="guide-section-tip">{spreadBundle.difficultyHint}</p>
                ) : null}
                {spreadBundle.sections.map((block) => (
                  <div key={block.title} className="guide-spread-block">
                    <h3 className="guide-spread-block__title">{block.title}</h3>
                    {block.body ? (
                      <p className="guide-section-body">{block.body}</p>
                    ) : null}
                    {block.items ? (
                      <ul className="guide-spread-block__list">
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="guide-section guide-section--footer">
            <h2 className="guide-section-title">快捷入口</h2>
            <p className="guide-section-body">
              {/* 「录屏科普工作台」(/explain) 从这里移除了：它是团队做短视频
                  用的工具（9:16 导出比例、纯净录屏模式），不是给读者的内容，
                  现已同 /demo 一起在生产环境 404。 */}
              <Link href="/archive" className="guide-footer-link">
                牌义档案库 →
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
