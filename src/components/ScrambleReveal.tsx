import type { CSSProperties, ElementType } from "react";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  id?: string;
};

/**
 * 文案切换时的文字容器（领域提示、输入引导等）。
 *
 * 名字里的 "Scramble" 是历史遗留：原本用 GSAP ScrambleText 做乱码过渡，
 * 但那条分支被 REGRESSION_STATIC_LAYOUT 常量彻底关掉了很久，
 * 实际行为一直只是「把 text 渲染出来」。删掉常量后这里就只剩这件事。
 *
 * 如果以后要把过渡效果加回来：在这里用 useGSAP 包 scrambleToText
 * （src/features/motion/scrambleText.gsap.ts 还在），并且记得
 * 服务端要先把 text 正常渲染出来，别再让文字依赖动效才可见
 * ——参见 HeroTitleSplit 那次「标题靠 GSAP 才显形」的教训。
 */
export default function ScrambleReveal({
  text,
  className,
  style,
  as: Tag = "p",
  id,
}: Props) {
  return (
    <Tag id={id} className={className} style={style}>
      {text}
    </Tag>
  );
}
