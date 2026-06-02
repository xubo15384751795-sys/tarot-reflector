"use client";

import type { ArchiveCardData } from "./types";
import { TarotThumbCard } from "@/components/ui/TarotThumbCard";

export function ArchiveCard({
  card,
  onClick,
}: {
  card: ArchiveCardData;
  onClick: () => void;
}) {
  return (
    <TarotThumbCard
      nameZh={card.name_zh}
      nameEn={card.name_en}
      imageSrc={card.image}
      indexLabel={
        card.arcana === "major" && card.number != null
          ? String(card.number).padStart(2, "0")
          : undefined
      }
      onClick={onClick}
    />
  );
}
