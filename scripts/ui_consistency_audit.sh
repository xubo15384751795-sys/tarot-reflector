#!/bin/bash
# ─────────────────────────────────────────────────────────────
# UI 一致性基线 / 守卫
# 用法：bash scripts/ui_consistency_audit.sh
# 每一轮收敛后重跑，看这些数字是否下降。
# （Phase 9 会把关键项接成 CI 守卫；现在先做度量。）
# ─────────────────────────────────────────────────────────────
cd "$(dirname "$0")/.." || exit 1
CSS="src/styles"
TSX="src --include=*.tsx"

count() { grep -rhoE "$1" $2 2>/dev/null | wc -l | tr -d ' '; }

echo "═══════════ 阈牌 UI 一致性基线 ═══════════"
date "+%Y-%m-%d %H:%M"
echo

echo "── 1. 硬编码金色（裸 rgb/rgba，应为 var(--accent*)）──"
for g in "185, ?149, ?82" "214, ?178, ?109" "206, ?185, ?138" "198, ?161, ?92"; do
  c=$(grep -rhoE "rgba?\($g" src 2>/dev/null | wc -l | tr -d ' ')
  printf "  rgba(%s…) : %s\n" "$(echo "$g" | tr -d ' ?')" "$c"
done
TOTAL_GOLD=$(grep -rhoE "rgba?\((185, ?149, ?82|214, ?178, ?109|206, ?185, ?138|198, ?161, ?92)" src 2>/dev/null | wc -l | tr -d ' ')
echo "  ▸ 金色裸值合计：$TOTAL_GOLD"
echo

echo "── 2. 字号 ──"
echo "  CSS  font-size:Npx 处数        : $(count 'font-size: ?[0-9.]+px' "$CSS")"
echo "  CSS  不同 font-size 值          : $(grep -rhoE 'font-size: ?[0-9.]+px' $CSS 2>/dev/null | sort -u | wc -l | tr -d ' ')"
echo "  TSX  text-[Npx] 处数            : $(count 'text-\[[0-9.]+px\]' "$TSX")"
echo "  TSX  不同 text-[Npx] 值         : $(grep -rhoE 'text-\[[0-9.]+px\]' src --include=*.tsx 2>/dev/null | sort -u | wc -l | tr -d ' ')"
echo "  半像素字号（.5px）             : $(grep -rhoE '(font-size: ?[0-9]+\.5px|text-\[[0-9]+\.5px\])' src 2>/dev/null | wc -l | tr -d ' ')"
echo

echo "── 3. 圆角 ──"
echo "  border-radius: 100px（旧 pill）: $(count 'border-radius: ?100px' "$CSS")"
echo "  border-radius: 999px（pill）   : $(count 'border-radius: ?999px' "$CSS")"
echo "  CSS 不同 border-radius 值       : $(grep -rhoE 'border-radius: ?[0-9.]+px' $CSS 2>/dev/null | sort -u | wc -l | tr -d ' ')"
echo

echo "── 4. 动效 ──"
echo "  transition: all                : $(count 'transition: all' "$CSS")"
echo "  Material 缓动(0.4,0,0.2,1)     : $(count 'cubic-bezier\(0\.4, ?0, ?0\.2, ?1\)' "$CSS")"
echo "  裸 transition 时长(0.Ns/Nms)   : $(grep -rhoE 'transition:[^;]*[0-9.]+m?s' $CSS 2>/dev/null | wc -l | tr -d ' ')"
echo "  使用 var(--dur-*) 处数          : $(count 'var\(--dur-' "$CSS")"
echo "  使用 var(--ease-*) 处数         : $(count 'var\(--ease-' "$CSS")"
echo

echo "── 5. 阴影 ──"
echo "  手写 box-shadow（含 rgba）处数 : $(grep -rhoE 'box-shadow:[^;]*rgba' $CSS 2>/dev/null | wc -l | tr -d ' ')"
echo "  使用 var(--shadow-*) 处数       : $(count 'var\(--shadow-' "$CSS")"
echo

echo "── 6. 组件分裂 ──"
echo "  按钮类 (.btn-primary/.btn-secondary/.hero-cta/.action-pill) :"
for b in btn-primary btn-secondary hero-cta action-pill; do
  echo "    .$b : $(grep -rhoE "\.$b\b|\"$b\"|'$b'|className=[^>]*$b" src 2>/dev/null | wc -l | tr -d ' ')"
done
echo "  Badge 类 (.chip/.pill-accent/.status-pill) :"
for b in chip pill-accent status-pill; do
  echo "    .$b : $(grep -rhoE "\b$b\b" src 2>/dev/null | wc -l | tr -d ' ')"
done
echo

echo "── 7. 间距裸值（内联 px padding/margin in TSX style）──"
echo "  TSX 内联 padding/margin px      : $(grep -rhoE '(padding|margin)[A-Za-z]*: ?[\"'\''`]?[0-9]+px' src --include=*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "  使用 var(--space-*) 处数        : $(count 'var\(--space-' "src")"
echo
echo "═══════════════════════════════════════════"
