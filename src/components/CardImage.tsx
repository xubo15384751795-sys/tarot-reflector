"use client";

import Image from "next/image";
import type { Orientation } from "@/lib/schema";

type Props = {
  /** Path under /public to the card image. Required — no placeholder fallback. */
  image: string;
  /** English card name, used for alt text. */
  cardName: string;
  zhName: string;
  orientation: Orientation;
  /** When true, render at lower priority (used during shuffle/reveal). */
  eager?: boolean;
};

/**
 * Renders a real Rider-Waite-Smith card face. Reversed cards are rotated 180°
 * around the card's center. The outer rounded mask and inset shadows match
 * the existing Obsidian Glass aesthetic so the photographic scan sits inside
 * the card frame cleanly.
 */
export default function CardImage({
  image,
  cardName,
  zhName,
  orientation,
  eager = false,
}: Props) {
  if (!image) {
    // Hard fail — we promised the user no fallbacks.
    throw new Error("CardImage: `image` is required, no placeholder fallback.");
  }
  const isReversed = orientation === "reversed";
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0"
        style={{
          transform: isReversed ? "rotate(180deg)" : undefined,
          // 用品牌缓动，不用 Material 的 (0.4,0,0.2,1)。
          // ui:guard 禁了它，但以前只扫 src/styles，写在 tsx 内联里就漏过去了。
          transition: "transform var(--dur-page) var(--ease-soft)",
        }}
      >
        <Image
          src={image}
          alt={`${cardName} · ${zhName}`}
          fill
          sizes="(min-width: 1280px) 420px, (min-width: 768px) 360px, 220px"
          priority={eager}
          className="object-cover"
        />
      </div>
    </div>
  );
}
