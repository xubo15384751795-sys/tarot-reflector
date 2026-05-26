"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ArchiveCardData } from "./types";

export function ArchiveCard({
  card,
  onClick,
}: {
  card: ArchiveCardData;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] rounded-2xl h-full flex flex-col"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="archive-border-thin overflow-hidden transition-all duration-500 ease-out group-hover:border-[rgba(206,185,138,0.3)] group-hover:shadow-[0_0_30px_rgba(206,185,138,0.06)] flex flex-col h-full"
        style={{ background: "var(--bg-glass)" }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "600 / 1050" }}
        >
          <Image
            src={card.image}
            alt={card.name_en}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(8,7,10,0.85) 0%, rgba(8,7,10,0.3) 60%, transparent 100%)",
            }}
          />
          {card.arcana === "major" && card.number != null && (
            <span
              className="absolute top-2 right-2.5 text-[10px] tracking-[0.08em] font-mono"
              style={{ color: "var(--text-faint)", opacity: 0.6 }}
            >
              {String(card.number).padStart(2, "0")}
            </span>
          )}
        </div>

        <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1">
          <h3
            className="text-[15px] leading-tight mb-0.5"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}
          >
            {card.name_zh}
          </h3>
          <p
            className="text-[10px] tracking-[0.06em] mb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            {card.name_en}
          </p>
          <div className="flex flex-wrap gap-1 mt-auto">
            {card.traditional.upright.keywords_zh.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="inline-block px-2 py-0.5 rounded-full text-[10px] leading-tight"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  border: "1px solid rgba(206,185,138,0.12)",
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
