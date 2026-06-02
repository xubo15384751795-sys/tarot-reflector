/**
 * 全局 GSAP 插件注册（仅执行一次）。
 * 从 `gsap` npm 包导入，无需 Club 或私有 registry。
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

let registered = false;

export function ensureGsapPlugins(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    useGSAP,
    DrawSVGPlugin,
    CustomEase,
    CustomBounce,
    Flip,
    SplitText,
    Observer,
    ScrambleTextPlugin,
  );
  CustomBounce.create("cardLand", {
    strength: 0.52,
    endAtStart: false,
    squash: 0.38,
    squashID: "cardLand-squash",
  });
  registered = true;
}

/** 牌面落定缓动 — CustomBounce，比 bounce.out 更贴纸质落牌感 */
export const CARD_LAND_EASE = "cardLand";

if (typeof window !== "undefined") {
  ensureGsapPlugins();
}
