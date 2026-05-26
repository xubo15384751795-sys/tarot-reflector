import { Composition } from "remotion";
import { TarotShortDemo } from "./compositions/TarotShortDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="TarotShortDemo"
      component={TarotShortDemo}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
