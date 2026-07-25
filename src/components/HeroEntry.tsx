"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Domain, UserInput } from "@/lib/schema";
import { HomeEntryCard } from "@/components/HomeEntryCard";
import { ManuscriptTag } from "@/components/ui/ManuscriptTag";
import ScrambleReveal from "@/components/ScrambleReveal";
import StageAmbient from "@/components/StageAmbient";
import { springSmall } from "@/features/motion";

type Props = {
  onSubmit: (input: UserInput) => void;
  embedded?: boolean;
  onBack?: () => void;
};

const domainTips: Record<Domain, string> = {
  love: "这张牌不能替对方发言，但可以帮你看见自己在这段关系里的感受。",
  career: "工作选择没有标准答案，但牌面可以帮你看见当前最值得关注的方向。",
  project: "项目进展往往比你感受的更有序，牌面会帮你找到卡住的那个点。",
  study: "学习不只是为了结果，过程中的每一层理解都在改变你。",
  self: "向内看需要勇气，牌面只是一面镜子，答案始终在你那里。",
  money: "财务不只是数字，它反映的是你和资源之间的关系。",
};

const domainInputHints: Record<Domain, string> = {
  love: "一段关系、一种感受，或一个你想说清的念头……",
  career: "一个职业选择、团队处境，或工作上的卡点……",
  project: "项目进展、协作摩擦，或下一步该怎么走……",
  study: "考试、方向选择，或学习里反复出现的困惑……",
  self: "情绪、习惯，或你此刻最想照见自己的那一面……",
  money: "收入、支出习惯，或与金钱相关的决定……",
};

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.6-7-10.5C5 6 7.5 4 10 4c1.4 0 2.5.7 3 1.5C13.5 4.7 14.6 4 16 4c2.5 0 4.5 2 4.5 4.5 0 5.9-7 11.5-7 11.5z" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="7" width="17" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <polyline points="3,7 12,11 21,7" />
      <line x1="12" y1="11" x2="12" y2="21" />
    </svg>
  );
}
function IconGrad() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 9 L12 4 L22 9 L12 14 Z" />
      <path d="M6 11 V16 C6 16 8.5 18 12 18 C15.5 18 18 16 18 16 V11" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5C14.5 8.5 13.4 8 12 8s-2.5.5-2.5 1.7c0 2.6 5 1.6 5 4.6 0 1.2-1.1 1.7-2.5 1.7s-2.5-.5-2.5-1.7" />
      <line x1="12" y1="6.5" x2="12" y2="17.5" />
    </svg>
  );
}
function IconSparkSmall() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3 L20 6 V12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 V6 Z" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="14,6 8,12 14,18" />
    </svg>
  );
}

const DOMAINS: { value: Domain; label: string; icon: ReactNode }[] = [
  { value: "love", label: "感情", icon: <IconHeart /> },
  { value: "career", label: "工作", icon: <IconBriefcase /> },
  { value: "project", label: "项目", icon: <IconBox /> },
  { value: "study", label: "学习", icon: <IconGrad /> },
  { value: "self", label: "自我", icon: <IconUser /> },
  { value: "money", label: "财务", icon: <IconDollar /> },
];

export default function HeroEntry({ onSubmit, embedded = false, onBack }: Props) {
  const [question, setQuestion] = useState("");
  const [domain, setDomain] = useState<Domain>("self");

  const canSubmit = question.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ question: question.trim(), domain });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSubmit) handleSubmit();
  };

  return (
    <div className={embedded ? "hero-entry hero-entry--embedded" : "hero-entry"}>
      {!embedded && (
        <>
          <StageAmbient variant="home" />
          <div aria-hidden className="hero-entry__bg" style={{ background: "var(--hero-bg)" }} />
          <div aria-hidden className="hero-entry__noise" />
        </>
      )}

      <main className="hero-entry__main">
        {onBack && (
          <div className="hero-entry__toolbar">
            <button type="button" onClick={onBack} className="action-pill">
              <IconChevronLeft />
              <span>返回</span>
            </button>
          </div>
        )}

        <div className="hero-entry__grid">
          <motion.section
            initial={embedded ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSmall}
            className="hero-entry__copy"
          >
            <h1 className="hero-entry__headline hero-title">
              {embedded ? (
                <>
                  写下你想
                  <br />
                  靠近的事。
                </>
              ) : (
                <>
                  翻开一页档案，
                  <br />
                  看见你问题的结构。
                </>
              )}
            </h1>

            <p className="hero-entry__intro">
              {embedded
                ? "不用写得很完整。牌面会帮你看见问题的轮廓。"
                : "慢慢写下此刻最占据你的那件事。"}
              {!embedded && (
                <span className="hero-entry__intro-muted">
                  {" "}
                  这张牌不是答案，是一面古老的镜子。
                </span>
              )}
            </p>

            <div className="hero-input glass-lens glass-lens--input">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKey}
                placeholder={question.trim() ? "继续写下你想问的事……" : " "}
                aria-describedby={!question.trim() ? "hero-domain-hint" : undefined}
                autoFocus
              />
              <span className="hero-input-spark">
                <IconSparkSmall />
              </span>
            </div>

            {!question.trim() && (
              <ScrambleReveal
                id="hero-domain-hint"
                as="p"
                text={domainInputHints[domain]}
                className="hero-entry__hint"
              />
            )}

            <div className="hero-entry__chips" role="group" aria-label="问题领域">
              {DOMAINS.map((d) => (
                <ManuscriptTag
                  key={d.value}
                  active={domain === d.value}
                  icon={d.icon}
                  onClick={() => setDomain(d.value)}
                >
                  {d.label}
                </ManuscriptTag>
              ))}
            </div>

            <ScrambleReveal text={domainTips[domain]} className="hero-entry__domain-tip" />

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSmall, delay: 0.12 }}
              className={`hero-cta hero-entry__cta ${canSubmit ? "" : "is-disabled"}`}
            >
              <IconSparkSmall />
              <span className="ml-2 tracking-[0.12em]">翻开这一页</span>
            </motion.button>
          </motion.section>

          <section className="hero-entry__visual">
            <HomeEntryCard size="hero" />
          </section>
        </div>
      </main>

      <footer className="hero-entry__footer">
        <span className="hero-entry__footer-icon">
          <IconShield />
        </span>
        <span>
          基于 Rider–Waite–Smith 传统牌义的图像档案。系统不会替你做决定，只照亮牌面上的符号。
        </span>
      </footer>
    </div>
  );
}
