/**
 * Remotion Composition — 塔罗竖屏短视频
 *
 * 预留结构，未来接入 Remotion 时使用。
 * 当前不导出 MP4，只在网页内预览。
 */

import type { ReadingScript } from "@/types/readingScript";

type Props = {
  scenes: ReadingScript["scenes"];
  cover: ReadingScript["cover"];
};

export function TarotShortVideo({ scenes: _scenes, cover: _cover }: Props) {
  // Placeholder — 实际 Remotion 渲染逻辑在此实现
  return null;
}
