"use client";

import { motion } from "framer-motion";
import { CornerOrnament, DividerLine } from "./ArchiveEmblems";

type Relationship = {
  from_card: string;
  to_card: string;
  relationship_type: string;
  description_zh: string;
};

type Props = {
  relationships: Relationship[];
  narrative: string;
  tension_points: string[];
  flow_description: string;
  onNext: () => void;
};

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="10,6 16,12 10,18" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function RelationshipAnalysis({
  relationships,
  narrative,
  tension_points,
  flow_description,
  onNext,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[560px] mx-auto flex flex-col gap-6"
    >
      <div className="flex items-center justify-center gap-3">
        <DividerLine width={28} />
        <span className="text-[11px] tracking-[0.16em]" style={{ color: "var(--ink-warm)" }}>
          牌与牌之间
        </span>
        <DividerLine width={28} />
      </div>

      {/* Relationship connections */}
      <div className="archive-border-thin relative p-5" style={{ background: "var(--bg-glass)" }}>
        <CornerOrnament size={14} position="tl" className="absolute top-1 left-1" style={{ opacity: 0.4 }} />
        <CornerOrnament size={14} position="tr" className="absolute top-1 right-1" style={{ opacity: 0.4 }} />
        <CornerOrnament size={14} position="bl" className="absolute bottom-1 left-1" style={{ opacity: 0.4 }} />
        <CornerOrnament size={14} position="br" className="absolute bottom-1 right-1" style={{ opacity: 0.4 }} />

        <div className="flex flex-col gap-3">
          {relationships.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <div
                className="flex items-center shrink-0 mt-0.5"
                style={{ color: "var(--accent)", opacity: 0.5 }}
              >
                <IconLink />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-light" style={{ color: "var(--text-primary)" }}>
                    {r.from_card}
                  </span>
                  <span className="text-[10px] tracking-[0.06em]" style={{ color: "var(--ink-warm)" }}>
                    ↔
                  </span>
                  <span className="text-[13px] font-light" style={{ color: "var(--text-primary)" }}>
                    {r.to_card}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                    style={{
                      color: "var(--accent)",
                      border: "1px solid var(--accent-dim)",
                      background: "var(--accent-dim)",
                    }}
                  >
                    {r.relationship_type}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  {r.description_zh}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tension points */}
      {tension_points.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] tracking-[0.14em]" style={{ color: "var(--text-faint)" }}>
            张力点
          </span>
          <div className="flex flex-wrap gap-2">
            {tension_points.map((tp, i) => (
              <span
                key={i}
                className="text-[12px] px-3 py-1.5 rounded-lg"
                style={{
                  color: "var(--copper)",
                  border: "1px solid rgba(189, 138, 94, 0.2)",
                  background: "rgba(189, 138, 94, 0.06)",
                }}
              >
                {tp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Narrative pull-quote */}
      <div className="insight-card">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)", opacity: 0.5 }}>
            <IconSpark />
          </span>
          <p className="text-[15px] leading-[1.7] tracking-[-0.003em]" style={{ color: "var(--text-primary)" }}>
            {narrative}
          </p>
        </div>
      </div>

      {/* Flow description */}
      <p className="text-[14px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
        {flow_description}
      </p>

      <div className="flex justify-end">
        <button onClick={onNext} className="btn-primary" style={{ padding: "12px 26px", fontSize: "14px" }}>
          <span>查看整体解读</span>
          <IconChevronRight />
        </button>
      </div>
    </motion.div>
  );
}
