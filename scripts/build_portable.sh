#!/bin/bash
# ─────────────────────────────────────────────────────────────
# 构建「解压即双击运行」的离线包（隔离：Node 打进文件夹，不装系统）
#
# 用法：
#   PACKAGE_BUILD=1 npx next build       # 先产出 standalone（本脚本不重复构建）
#   bash scripts/build_portable.sh mac       # 生成 Mac 包
#   bash scripts/build_portable.sh windows   # 生成 Windows 包
#
# 产物：dist/阈牌-<平台>/  以及  dist/阈牌-<平台>.zip
# ─────────────────────────────────────────────────────────────
set -euo pipefail

PLATFORM="${1:-mac}"
NODE_VERSION="v20.18.1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STANDALONE="$ROOT/.next/standalone"
if [ ! -f "$STANDALONE/server.js" ]; then
  echo "❌ 没找到 standalone 构建。先运行：PACKAGE_BUILD=1 npx next build"
  exit 1
fi

OUT="$ROOT/dist/阈牌-$PLATFORM"
rm -rf "$OUT"
mkdir -p "$OUT/app" "$OUT/runtime"

echo "▸ 拷贝应用本体…"
cp -R "$STANDALONE/." "$OUT/app/"
mkdir -p "$OUT/app/.next"
cp -R "$ROOT/.next/static" "$OUT/app/.next/static"
cp -R "$ROOT/public" "$OUT/app/public"

# 剔除 sharp（图像优化已设 unoptimized，运行时不会用到它）。
# 它带平台相关的原生 .node 二进制，留着会成为跨系统隐患，删掉更干净也更小。
rm -rf "$OUT/app/node_modules/sharp" "$OUT/app/node_modules/@img"

# 缓存下载的 node 压缩包，避免重复下载
CACHE="$ROOT/dist/.node-cache"
mkdir -p "$CACHE"

fetch_node() {
  # $1 = node 发行三元组目录名（如 darwin-arm64）；$2 = 解压到的子目录名
  local triple="$1" dest="$2"
  local tarball="node-$NODE_VERSION-$triple.tar.gz"
  if [ ! -f "$CACHE/$tarball" ]; then
    echo "▸ 下载 Node $NODE_VERSION ($triple)…"
    curl -fL --progress-bar "https://nodejs.org/dist/$NODE_VERSION/$tarball" -o "$CACHE/$tarball"
  fi
  mkdir -p "$OUT/runtime/node/$dest/bin"
  tar -xzf "$CACHE/$tarball" -C "$CACHE"
  cp "$CACHE/node-$NODE_VERSION-$triple/bin/node" "$OUT/runtime/node/$dest/bin/node"
  chmod +x "$OUT/runtime/node/$dest/bin/node"
}

if [ "$PLATFORM" = "mac" ]; then
  fetch_node "darwin-arm64" "arm64"
  fetch_node "darwin-x64"   "x64"

  cat > "$OUT/启动阈牌.command" <<'LAUNCH'
#!/bin/bash
# 阈牌 启动器 —— 全程在本文件夹内运行，不安装任何系统软件
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# 解除「下载隔离」标记（否则 macOS 会拦内置 Node）
xattr -dr com.apple.quarantine "$DIR" 2>/dev/null || true

ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then NODE="$DIR/runtime/node/arm64/bin/node"; else NODE="$DIR/runtime/node/x64/bin/node"; fi
if [ ! -x "$NODE" ]; then echo "找不到内置 Node，请重新完整解压 zip。"; read -n1 -r; exit 1; fi

export PORT="${PORT:-4173}"
export HOSTNAME="127.0.0.1"
export NODE_ENV="production"
URL="http://localhost:$PORT"

echo "正在启动阈牌……请勿关闭此窗口（用完后关闭本窗口即可停止）"
"$NODE" "$DIR/app/server.js" &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT

for i in $(seq 1 40); do
  if curl -s "$URL" >/dev/null 2>&1; then break; fi
  sleep 0.5
done
open "$URL" 2>/dev/null || true
echo ""
echo "  阈牌已启动：$URL"
echo "  浏览器没自动打开的话，手动复制上面网址到浏览器即可。"
echo "  ▸ 关闭此窗口 = 停止阈牌（不会在你电脑上留下任何后台程序）"
echo ""
wait $SERVER_PID
LAUNCH
  chmod +x "$OUT/启动阈牌.command"

  cat > "$OUT/使用说明.txt" <<'README'
阈牌 · 离线版（Mac）使用说明
================================

【怎么打开】
1) 双击文件夹里的「启动阈牌.command」。
2) 第一次打开，如果系统提示“无法打开，因为来自身份不明的开发者”：
   → 在「启动阈牌.command」上点【右键】→【打开】→ 再点【打开】。
   （这一步每台电脑只需做一次。）
3) 会弹出一个黑色小窗口并自动打开浏览器，看到阈牌就成功了。

【怎么关闭】
关闭那个黑色小窗口即可。阈牌随之停止，不会在后台偷偷运行。

【会不会弄乱我的电脑？】
不会。Node 运行环境就打包在这个文件夹的 runtime 里，
不安装到系统、不修改任何系统设置。
不想要了，直接把整个文件夹拖进废纸篓即可彻底删除。

【想要 AI 解读？】
默认用内置牌义，无需联网也能用。
若要开启 AI：在 app 文件夹里新建文本文件 .env.local，写入两行：
  AI_PROVIDER=deepseek
  DEEPSEEK_API_KEY=你的密钥
保存后重新启动即可。（密钥怎么拿见随附的部署指南 PDF）
README

elif [ "$PLATFORM" = "windows" ]; then
  # Windows 的 Node 是 .zip，里面是 node.exe（不是 bin/node）
  WIN_ZIP="node-$NODE_VERSION-win-x64.zip"
  if [ ! -f "$CACHE/$WIN_ZIP" ]; then
    echo "▸ 下载 Node $NODE_VERSION (win-x64)…"
    curl -fL --progress-bar "https://nodejs.org/dist/$NODE_VERSION/$WIN_ZIP" -o "$CACHE/$WIN_ZIP"
  fi
  mkdir -p "$OUT/runtime/node/x64"
  unzip -oq "$CACHE/$WIN_ZIP" -d "$CACHE"
  cp "$CACHE/node-$NODE_VERSION-win-x64/node.exe" "$OUT/runtime/node/x64/node.exe"

  cat > "$OUT/启动阈牌.bat" <<'LAUNCH'
@echo off
chcp 65001 >nul
title 阈牌（关闭本窗口即停止）
cd /d "%~dp0"

set "NODE=%~dp0runtime\node\x64\node.exe"
if not exist "%NODE%" (
  echo 找不到内置 Node，请重新完整解压 zip。
  pause
  exit /b 1
)

set "PORT=4173"
set "HOSTNAME=127.0.0.1"
set "NODE_ENV=production"

echo 正在启动阈牌……请勿关闭此窗口（用完后关闭本窗口即可停止）
start "" "%NODE%" "%~dp0app\server.js"

echo 等待服务启动……
timeout /t 3 /nobreak >nul
start "" "http://localhost:%PORT%"

echo.
echo   阈牌已启动：http://localhost:%PORT%
echo   浏览器没自动打开的话，手动把上面网址粘贴到浏览器。
echo   关闭此窗口 = 停止阈牌。
echo.
pause >nul
LAUNCH

  cat > "$OUT/使用说明.txt" <<'README'
阈牌 · 离线版（Windows）使用说明
==================================

【怎么打开】
1) 双击文件夹里的「启动阈牌.bat」。
2) 第一次打开，如果出现蓝色提示“Windows 已保护你的电脑”：
   → 点【更多信息】→【仍要运行】。（每台电脑只需一次。）
3) 会弹出一个命令行小窗口并自动打开浏览器，看到阈牌就成功了。
   若被防火墙询问，选择“允许访问”（仅本机使用即可）。

【怎么关闭】
关闭那个命令行小窗口即可。阈牌随之停止，不会在后台运行。

【会不会弄乱我的电脑？】
不会。Node 运行环境就打包在这个文件夹的 runtime 里，
不安装到系统、不写注册表、不改系统设置。
不想要了，直接删除整个文件夹即可彻底卸载。

【想要 AI 解读？】
默认用内置牌义，无需联网也能用。
若要开启 AI：在 app 文件夹里新建文本文件 .env.local，写入两行：
  AI_PROVIDER=deepseek
  DEEPSEEK_API_KEY=你的密钥
保存后重新启动即可。（密钥怎么拿见随附的部署指南 PDF）
README

else
  echo "未知平台：$PLATFORM（应为 mac 或 windows）"; exit 1
fi

echo "▸ 打包 zip…"
cd "$ROOT/dist"
rm -f "阈牌-$PLATFORM.zip"
zip -rqy "阈牌-$PLATFORM.zip" "阈牌-$PLATFORM"
echo "✅ 完成："
du -sh "$ROOT/dist/阈牌-$PLATFORM" "$ROOT/dist/阈牌-$PLATFORM.zip"
