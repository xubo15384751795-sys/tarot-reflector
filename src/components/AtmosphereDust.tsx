"use client";

import { useMemo, type CSSProperties } from "react";
import { useReducedMotion } from "@/features/motion";

type Mote = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
};

function seedMotes(count: number): Mote[] {
  const out: Mote[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i * 97 + 13) % 100;
    out.push({
      id: i,
      x: (t * 7.3 + i * 11) % 100,
      y: (t * 5.1 + i * 17) % 100,
      size: 1 + (i % 3) * 0.4,
      delay: (i % 12) * 0.9,
      duration: 18 + (i % 8) * 4,
      drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 3),
    });
  }
  return out;
}

/** 档案室浮尘 — 极淡、慢漂，非游戏粒子 */
export default function AtmosphereDust({ density = 36 }: { density?: number }) {
  const reducedMotion = useReducedMotion();
  const motes = useMemo(() => seedMotes(density), [density]);

  if (reducedMotion) return null;

  return (
    <div className="atmosphere-dust" aria-hidden>
      {motes.map((m) => (
        <span
          key={m.id}
          className="atmosphere-dust__mote"
          style={
            {
              "--x": `${m.x}%`,
              "--y": `${m.y}%`,
              "--sz": `${m.size}px`,
              "--delay": `${m.delay}s`,
              "--dur": `${m.duration}s`,
              "--drift": `${m.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
