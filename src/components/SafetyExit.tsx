"use client";

/**
 * SafetyExit — 危机词触发时的温和软出口
 *
 * 设计原则：
 *   1. 不说教、不医学化、不"教育"——只承认 + 给资源
 *   2. 显眼但不阻塞——保留"我没事，继续"让有自主能力的成年人决定
 *   3. 资源信息**最显眼**——它是这页存在的唯一理由
 *   4. 视觉延续主站语言（暖光 + 衬线 + 金线），不要切换到"急诊室"
 *
 * 这个组件**不能**做的事：
 *   - 用塔罗牌"安抚"严重痛苦
 *   - 试图心理分析、解读"为什么会这样"
 *   - 替专业的人做判断
 */

import { motion } from "framer-motion";
import { DividerLine } from "./ArchiveEmblems";

type Hotline = {
  name: string;
  number: string;
  /** 一行说明 */
  note?: string;
};

const HOTLINES: Hotline[] = [
  {
    name: "希望 24 热线",
    number: "400-161-9995",
    note: "24 小时 · 全国",
  },
  {
    name: "北京心理危机研究与干预中心",
    number: "010-82951332",
    note: "24 小时 · 全国可拨",
  },
  {
    name: "上海市心理援助热线",
    number: "021-12320-5",
    note: "24 小时",
  },
];

type Props = {
  /** 用户原始问题（不展示，仅用于内部上下文）*/
  question: string;
  /** 软逃逸：用户确认想继续走解读流程 */
  onContinueAnyway: () => void;
  /** 返回上一步 / 入口 */
  onBack: () => void;
};

export default function SafetyExit({ onContinueAnyway, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[520px] mx-auto flex flex-col items-center gap-8 px-6 py-12"
    >
      {/* 温和承认句 —— 衬线，留白 */}
      <div className="text-center flex flex-col items-center gap-4">
        <DividerLine width={36} />
        <p
          className="text-[15px] md:text-[16px] leading-[1.85] tracking-[0.005em]"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-serif-like)",
            maxWidth: "22em",
          }}
        >
          你写下的话让我有点担心你。
          <br />
          我能做的有限——但有人能更好地陪你。
        </p>
        <DividerLine width={36} />
      </div>

      {/* 热线 —— 最显眼的部分 */}
      <div className="w-full flex flex-col gap-3">
        {HOTLINES.map((h) => (
          <a
            key={h.number}
            href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
            className="archive-link w-full"
            style={{
              padding: "16px 20px",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span className="flex flex-col items-start gap-1 min-w-0">
              <span
                className="text-[12px] tracking-[0.10em]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {h.name}
              </span>
              <span
                className="text-[18px] tracking-[0.02em]"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-serif-like)",
                  fontWeight: 500,
                }}
              >
                {h.number}
              </span>
            </span>
            {h.note && (
              <span
                className="text-[11px] tracking-[0.10em] shrink-0 text-right"
                style={{ color: "var(--text-faint)" }}
              >
                {h.note}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* 极小段说明 */}
      <p
        className="text-[11px] tracking-[0.04em] leading-[1.65] text-center"
        style={{ color: "var(--text-faint)", maxWidth: "26em" }}
      >
        你写下的内容只存在你自己的设备上。如果你愿意，关掉这一页，去拨一个号码——
        然后再回来。档案会等你。
      </p>

      <DividerLine width={48} />

      {/* 软逃逸（最不显眼）+ 返回（次显眼） */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          type="button"
          onClick={onBack}
          className="archive-link"
          style={{ padding: "10px 24px" }}
        >
          <span>返回入口</span>
        </button>
        <button
          type="button"
          onClick={onContinueAnyway}
          className="text-[12px] tracking-[0.04em] underline underline-offset-4"
          style={{
            color: "var(--text-faint)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: 0.6,
          }}
        >
          我没事，继续翻档案
        </button>
      </div>
    </motion.div>
  );
}
