"use client";

/**
 * 档案室装饰元素合集 — SVG 炼金术圆环 / 月相 / 角饰 / 烛光
 *
 * 每个元素极轻、可复用、不携带任何交互逻辑。
 * 世界观语言：「神秘档案馆 / 炼金术手稿 / 月光博物馆」
 */

// ─── 四花色纹章 ───

export function SuitWands() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" opacity="0.3" />
      <path d="M12 4 L12 16" />
      <path d="M8 8 L12 12 L16 8" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

export function SuitCups() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" opacity="0.3" />
      <path d="M8 16 Q12 20 16 16" fill="currentColor" fillOpacity="0.08" />
      <path d="M7 14 C7 10, 9 8, 12 8 C15 8, 17 10, 17 14" />
      <line x1="9" y1="6" x2="15" y2="6" opacity="0.4" />
    </svg>
  );
}

export function SuitSwords() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" opacity="0.3" />
      <path d="M12 6 L12 4" />
      <path d="M8 16 L12 12 L16 16" />
      <path d="M12 12 L12 20" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

export function SuitPentacles() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" opacity="0.3" />
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.05" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

// ─── 炼金术圆环（多圈同心 + 刻度） ───

type AlchemicalRingProps = {
  size?: number;
  rings?: number;
  className?: string;
};

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function AlchemicalRing({ size = 280, rings = 4, className }: AlchemicalRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.45;
  const step = maxR / (rings + 0.5);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`pointer-events-none ${className ?? ""}`}
      style={{ opacity: 0.5, color: "var(--brass)" }}
    >
      <defs>
        <radialGradient id={`ring-fade-${size}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--brass)" stopOpacity="0" />
          <stop offset="60%" stopColor="var(--brass)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--brass)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 同心圆 */}
      {Array.from({ length: rings }).map((_, i) => {
        const r = maxR - i * step;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r3(r)}
            fill="none"
            stroke={`url(#ring-fade-${size})`}
            strokeWidth={i === 0 ? 0.6 : 0.35}
            opacity={1 - i * 0.12}
          />
        );
      })}
      {/* 刻度（12 等分） */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI) / 12;
        const inner = maxR - 2;
        const outer = maxR + 4;
        const x1 = r3(cx + Math.cos(a) * inner);
        const y1 = r3(cy + Math.sin(a) * inner);
        const x2 = r3(cx + Math.cos(a) * outer);
        const y2 = r3(cy + Math.sin(a) * outer);
        if (i % 3 === 0) return null; // only short ticks
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--brass)"
            strokeWidth={0.3}
            opacity={0.25}
            strokeLinecap="round"
          />
        );
      })}
      {/* 主刻度（12/3/6/9 方位）与对角交叉线 */}
      {[0, 3, 6, 9].map((h) => {
        const a = (h * Math.PI) / 6;
        const inner = maxR - 6;
        const outer = maxR + 6;
        return (
          <line
            key={`t${h}`}
            x1={r3(cx + Math.cos(a) * inner)}
            y1={r3(cy + Math.sin(a) * inner)}
            x2={r3(cx + Math.cos(a) * outer)}
            y2={r3(cy + Math.sin(a) * outer)}
            stroke="var(--brass)"
            strokeWidth={0.5}
            opacity={0.45}
            strokeLinecap="round"
          />
        );
      })}
      {/* 对角交叉线 */}
      <line x1={r3(cx - maxR * 0.7)} y1={r3(cy - maxR * 0.7)} x2={r3(cx + maxR * 0.7)} y2={r3(cy + maxR * 0.7)} stroke="var(--brass)" strokeWidth={0.2} opacity={0.12} />
      <line x1={r3(cx + maxR * 0.7)} y1={r3(cy - maxR * 0.7)} x2={r3(cx - maxR * 0.7)} y2={r3(cy + maxR * 0.7)} stroke="var(--brass)" strokeWidth={0.2} opacity={0.12} />
      {/* 中心点 */}
      <circle cx={cx} cy={cy} r={2} fill="var(--brass)" opacity={0.2} />
    </svg>
  );
}

// ─── 月相指示器 ───

type MoonPhaseProps = {
  phase?: number; // 0–1, default 0.65 (盈凸月)
  size?: number;
  className?: string;
};

export function MoonPhase({ phase = 0.65, size = 48, className }: MoonPhaseProps) {
  const c = size / 2;
  const r = size * 0.4;
  const offset = Math.round(Math.abs((phase - 0.5) * r * 1.6) * 10) / 10;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`pointer-events-none ${className ?? ""}`}
      style={{ opacity: 0.35, color: "var(--brass)" }}
    >
      {/* 满月底色（极淡） */}
      <circle cx={c} cy={c} r={r} fill="var(--candlelight)" stroke="var(--brass)" strokeWidth={0.3} opacity={0.4} />
      {/* 月相遮罩 */}
      <path
        d={`M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${offset} ${r} 0 0 ${phase > 0.5 ? 0 : 1} ${c} ${c - r} Z`}
        fill="var(--bg-base)"
        opacity={0.85}
      />
      {/* 右侧微光 */}
      <path
        d={`M ${r3(c + r * 0.1)} ${r3(c - r * 0.6)} A ${r3(r * 0.3)} ${r3(r * 0.3)} 0 0 1 ${r3(c + r * 0.1)} ${r3(c + r * 0.6)}`}
        fill="none"
        stroke="var(--brass)"
        strokeWidth={0.3}
        opacity={0.15}
      />
    </svg>
  );
}

// ─── 四角墨线装饰（档案夹角） ───

type CornerOrnamentProps = {
  size?: number;
  className?: string;
  position?: "tl" | "tr" | "bl" | "br";
  style?: React.CSSProperties;
};

export function CornerOrnament({ size = 24, className, position = "tl", style }: CornerOrnamentProps) {
  const flipX = position === "tr" || position === "br" ? -1 : 1;
  const flipY = position === "bl" || position === "br" ? -1 : 1;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`pointer-events-none ${className ?? ""}`}
      style={{ transform: `scale(${flipX}, ${flipY})`, color: "var(--ink-filigree)", opacity: 0.6, ...(style ?? {}) }}
    >
      {/* 两条细线成角 */}
      <path
        d={`M 2 ${size - 2} L 2 6 Q 2 2 6 2 L ${size - 2} 2`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.6}
        strokeLinecap="round"
      />
      {/* 内侧短装饰线 */}
      <path
        d={`M 6 ${size - 6} L 6 8 Q 6 6 8 6 L ${size - 6} 6`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.25}
        strokeLinecap="round"
        opacity={0.4}
      />
    </svg>
  );
}

// ─── 金箔分隔线 ───

type DividerLineProps = {
  className?: string;
  width?: number;
};

export function DividerLine({ className, width = 40 }: DividerLineProps) {
  const w = width;
  return (
    <svg viewBox={`0 0 ${w} 8`} width={w} height={8} className={className} style={{ opacity: 0.4, color: "var(--brass)" }}>
      <line x1={0} y1={4} x2={w * 0.35} y2={4} stroke="currentColor" strokeWidth={0.4} opacity={0.3} />
      <circle cx={w / 2} cy={4} r={1.5} fill="currentColor" opacity={0.5} />
      <line x1={w * 0.65} y1={4} x2={w} y2={4} stroke="currentColor" strokeWidth={0.4} opacity={0.3} />
    </svg>
  );
}

// ─── 档案编号标签 ───

type ArchiveLabelProps = {
  code?: string;
  className?: string;
};

export function ArchiveLabel({ code = "M.XXIV", className }: ArchiveLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className ?? ""}`}
      style={{
        fontSize: 9,
        letterSpacing: "0.12em",
        color: "var(--text-faint)",
        fontVariantNumeric: "tabular-nums",
        opacity: 0.6,
      }}
    >
      <svg viewBox="0 0 12 12" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={0.6} opacity={0.4}>
        <circle cx={6} cy={6} r={5} />
        <line x1={6} y1={1} x2={6} y2={11} />
        <line x1={1} y1={6} x2={11} y2={6} />
      </svg>
      {code}
    </span>
  );
}
