"use client";

import Image from "next/image";
import type { ArchiveCardData } from "./types";

export function ArchiveCard({
  card,
  onClick,
}: {
  card: ArchiveCardData;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="archive-thumb physical-card group relative text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] w-full"
    >
      <div className="card-thumb-frame">
        <div className="card-thumb-frame__image">
          <Image
            src={card.image}
            alt={card.name_en}
            fill
            sizes="(max-width: 560px) 45vw, (max-width: 900px) 22vw, 150px"
            className="object-cover"
          />
          {card.arcana === "major" && card.number != null && (
            <span className="card-thumb-frame__index" aria-hidden>
              {String(card.number).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>
      <span className="archive-thumb__label">{card.name_zh}</span>
      <span className="archive-thumb__meta">{card.name_en}</span>
    </button>
  );
}
