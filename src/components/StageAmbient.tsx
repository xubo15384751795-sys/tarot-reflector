type Variant = "home" | "archive" | "minimal";

type Props = {
  variant?: Variant;
};

/** 页面环境光层 — 烛光 + 雾幕 + 有机底景 */
export default function StageAmbient({ variant = "home" }: Props) {
  const showCandle = variant !== "minimal";
  const showWell = variant !== "minimal";
  const showOrganic = variant === "home";

  return (
    <div className="stage-ambient" aria-hidden>
      {showWell && <div className="stage-ambient__fog" />}
      {showCandle && <div className="stage-ambient__candle candle-glow" />}
      {showWell && <div className="stage-ambient__well" />}
      {variant === "home" && <div className="stage-ambient__floor" />}
      {showOrganic && (
        <div className="stage-ambient__organic">
          <svg viewBox="0 0 1440 380" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden>
            <path
              d="M-40 380 C120 280 200 320 340 240 S520 180 680 260 S920 120 1080 220 S1280 160 1480 300 L1480 380 Z"
              fill="currentColor"
              opacity="0.12"
            />
            <path
              d="M80 380 C200 300 280 340 420 260 M420 260 C480 220 560 200 640 240 M640 240 C720 280 800 200 900 260 M900 260 C980 300 1100 240 1200 300"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.35"
            />
            <path
              d="M200 380 C320 320 400 360 520 300 M520 300 C600 260 700 280 780 320 M1080 380 C1180 340 1260 300 1340 340"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.22"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
