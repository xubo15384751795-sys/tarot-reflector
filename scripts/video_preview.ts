/**
 * video:preview · Remotion 演示预览入口
 *
 * 项目主线不包含视频渲染（避免 ~50MB 依赖默认装到所有用户机器上），
 * 但 remotion/ 已经放好了完整骨架（Root.tsx + 一个 fixture 驱动的 demo）。
 *
 * 想跑视频预览：
 *   npm install --save-dev remotion @remotion/cli @remotion/player
 *   npm run video:preview
 *
 * 跑视频渲染：
 *   npx remotion render remotion/Root.tsx TarotShortDemo out/demo.mp4
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const remotionInstalled = existsSync(join(ROOT, "node_modules/remotion"));

if (!remotionInstalled) {
  console.log(`
Remotion 没装。跑预览前需要先：

  npm install --save-dev remotion @remotion/cli @remotion/player

骨架已就绪：
  remotion/Root.tsx                          ── Composition 定义
  remotion/compositions/TarotShortDemo.tsx   ── 9:16 演示场景
  fixtures/video_script_demo.json            ── 测试数据

装好后再次跑：
  npm run video:preview
`);
  process.exit(0);
}

// remotion 装好了 → 启 studio
const child = spawn("npx", ["remotion", "studio", "remotion/Root.tsx"], {
  stdio: "inherit",
  cwd: ROOT,
});

child.on("exit", (code) => process.exit(code ?? 0));
