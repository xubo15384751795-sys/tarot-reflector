import Image from "next/image";

type Props = {
  /** 摄影焦点：桌面书页区域 */
  focal?: "center" | "lower";
};

/** 首页真实书页舞台 — 摄影底图 + token 遮罩，替代 SVG/渐变模拟 */
export default function BookStageBackground({ focal = "lower" }: Props) {
  const objectPosition = focal === "lower" ? "50% 72%" : "50% 45%";

  return (
    <div className="book-stage" aria-hidden>
      <Image
        src="/images/stage-open-book.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="book-stage__photo"
        style={{ objectPosition }}
      />
      <div className="book-stage__veil book-stage__veil--top" />
      <div className="book-stage__veil book-stage__veil--center" />
      <div className="book-stage__veil book-stage__veil--vignette" />
    </div>
  );
}
