import { AbsoluteFill, Img, Sequence, useCurrentFrame, interpolate } from "remotion";
import demoFixture from "../../fixtures/video_script_demo.json";

type Scene = (typeof demoFixture.scenes)[number];

function SceneView({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 90, 120], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a12",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        opacity,
      }}
    >
      <Img
        src={`/cards/major/${scene.card_id.replace("major_", "").replace(/_/g, "_")}.jpg`}
        style={{
          width: 600,
          height: 1050,
          borderRadius: 16,
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 80,
          right: 80,
          textAlign: "center",
          color: "#f0ead6",
          fontSize: 48,
          fontFamily: "LXGW WenKai, serif",
          lineHeight: 1.6,
          textShadow: "0 2px 12px rgba(0,0,0,0.7)",
        }}
      >
        {scene.subtitle_zh}
      </div>
    </AbsoluteFill>
  );
}

export function TarotShortDemo() {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a12" }}>
      {demoFixture.scenes.map((scene, i) => (
        <Sequence
          key={scene.scene_id}
          from={i * scene.duration * 30}
          durationInFrames={scene.duration * 30}
        >
          <SceneView scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
