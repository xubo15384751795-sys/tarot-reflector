import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 右下角手稿式署名 */
  credit?: string;
};

/** 编辑级画框视口 — 薄边圆角框住主舞台，像展柜玻璃 */
export default function EditorialViewport({ children, credit }: Props) {
  return (
    <div className="editorial-viewport">
      <div className="editorial-viewport__frame" aria-hidden />
      {children}
      {credit && (
        <p className="editorial-viewport__credit" aria-hidden>
          {credit}
        </p>
      )}
    </div>
  );
}
