"use client";

import Image from "next/image";
import { cn } from "./cn";

type Props = {
  nameZh: string;
  nameEn: string;
  imageSrc: string;
  indexLabel?: string;
  className?: string;
  onClick?: () => void;
};

/** 档案馆牌面缩略索引 — 精致小尺寸，非海报墙 */
export function TarotThumbCard({
  nameZh,
  nameEn,
  imageSrc,
  indexLabel,
  className,
  onClick,
}: Props) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "archive-thumb archive-thumb-card physical-card group relative text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] w-full",
        className,
      )}
      aria-label={`${nameZh} · ${nameEn}`}
    >
      <div className="card-thumb-frame">
        <div className="card-thumb-frame__image">
          <Image
            src={imageSrc}
            alt={nameEn}
            fill
            sizes="(max-width: 560px) 45vw, (max-width: 900px) 14vw, 130px"
            className="object-cover"
          />
          {indexLabel && (
            <span className="card-thumb-frame__index" aria-hidden>
              {indexLabel}
            </span>
          )}
        </div>
      </div>
      <span className="archive-thumb__label">{nameZh}</span>
      <span className="archive-thumb__meta">{nameEn}</span>
    </Tag>
  );
}
