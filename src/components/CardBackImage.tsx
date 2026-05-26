"use client";

import Image from "next/image";

/** Public path to the RWS card back scan in /public. */
export const CARD_BACK_PATH = "/cards/major/back.jpg";

type Props = {
  /** When true, load with higher priority (flip / shuffle animations). */
  eager?: boolean;
  className?: string;
};

/**
 * Renders the real Rider-Waite-Smith card back. Used during shuffle and
 * pre-flip states — no CSS placeholder or text fallback.
 */
export default function CardBackImage({ eager = false, className }: Props) {
  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <Image
        src={CARD_BACK_PATH}
        alt="塔罗牌背面"
        fill
        sizes="(min-width: 1280px) 420px, (min-width: 768px) 360px, 220px"
        priority={eager}
        className="object-cover"
      />
    </div>
  );
}
