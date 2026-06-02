"use client";

import Link from "next/link";
import { DividerLine } from "./ArchiveEmblems";
import {
  DIFFICULTY_HINTS,
  TAROT_INTRO_SECTIONS,
  getSpreadDetailSections,
} from "@/lib/spreadGuide";
import { getSpreadDef } from "@/features/reading/lib/spreads";
import type { SpreadId } from "@/lib/schema";

type Props = {
  /** 当前高亮介绍的牌阵；推荐页可传推荐项 */
  focusSpreadId?: string | null;
  compact?: boolean;
};

export function SpreadGuidePanel({ focusSpreadId, compact = false }: Props) {
  const def = focusSpreadId ? getSpreadDef(focusSpreadId as SpreadId) : undefined;
  const detailSections = getSpreadDetailSections(def);
  const difficultyHint = def?.difficulty
    ? DIFFICULTY_HINTS[def.difficulty]
    : null;

  return (
    <div className={`spread-guide-panel ${compact ? "spread-guide-panel--compact" : ""}`}>
      <div className="spread-guide-panel__header">
        <DividerLine width={20} />
        <span className="spread-guide-panel__label">规则与牌阵说明</span>
        <DividerLine width={20} />
      </div>

      {TAROT_INTRO_SECTIONS.map((s) => (
        <section key={s.title} className="spread-guide-panel__section">
          <h3 className="spread-guide-panel__title">{s.title}</h3>
          <p className="spread-guide-panel__body">{s.body}</p>
        </section>
      ))}

      {def ? (
        <section className="spread-guide-panel__section spread-guide-panel__section--focus">
          <h3 className="spread-guide-panel__title spread-guide-panel__title--accent">
            当前牌阵
          </h3>
          {difficultyHint && (
            <p className="spread-guide-panel__hint">{difficultyHint}</p>
          )}
          {detailSections.map((s) => (
            <div key={s.title} className="spread-guide-panel__block">
              {s.title !== def.name_zh && (
                <h4 className="spread-guide-panel__subtitle">{s.title}</h4>
              )}
              {s.body && <p className="spread-guide-panel__body">{s.body}</p>}
              {s.items && (
                <ul className="spread-guide-panel__list">
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : (
        <section className="spread-guide-panel__section">
          <p className="spread-guide-panel__body spread-guide-panel__body--muted">
            点选左侧牌阵后，这里会显示每个牌位的含义与连读方式。
          </p>
        </section>
      )}

      <section className="spread-guide-panel__section spread-guide-panel__footer">
        <p className="spread-guide-panel__body spread-guide-panel__body--muted">
          想查某张牌的符号与正逆位档案？
        </p>
        <Link href="/archive" className="spread-guide-panel__link">
          打开牌义档案库 →
        </Link>
      </section>
    </div>
  );
}
