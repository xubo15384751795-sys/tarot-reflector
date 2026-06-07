#!/bin/bash
# ─────────────────────────────────────────────────────────────
# UI 一致性守卫：阻止已收敛的漂移复发。
# 用法：npm run ui:guard   （CI / 提交前可调用）
# 任一不变量被破坏即非零退出。
# ─────────────────────────────────────────────────────────────
cd "$(dirname "$0")/.." || exit 1
fail=0

check() {
  # $1 描述  $2 实测值  $3 允许上限
  if [ "$2" -gt "$3" ]; then
    printf "  ✗ %-40s %s（上限 %s）\n" "$1" "$2" "$3"
    fail=1
  else
    printf "  ✓ %-40s %s\n" "$1" "$2"
  fi
}

# 1) 产品面里的裸金色（排除 token 定义源、内部/演示页、stories）
GOLD=$(grep -rlE "rgba?\((185, ?149, ?82|214, ?178, ?109|206, ?185, ?138|198, ?161, ?92)" src --include="*.css" --include="*.tsx" 2>/dev/null \
  | grep -vE "tokens.css|DemoAnnotatedCard|VideoSceneRenderer|AstrolabeStarCard|CoverPreview|/motion-lab/|/lab/|/demo/|\.stories\." \
  | xargs grep -hoE "rgba?\((185, ?149, ?82|214, ?178, ?109|206, ?185, ?138|198, ?161, ?92)" 2>/dev/null | wc -l | tr -d ' ')
check "产品面裸金色 (应 var(--accent*))" "${GOLD:-0}" 0

# 2) transition: all
TALL=$(grep -rho "transition: all" src/styles 2>/dev/null | wc -l | tr -d ' ')
check "transition: all" "${TALL:-0}" 0

# 3) 半像素字号
HALF=$(grep -rhoE "(font-size: ?[0-9]+\.5px|text-\[[0-9]+\.5px\])" src 2>/dev/null | wc -l | tr -d ' ')
check "半像素字号 (.5px)" "${HALF:-0}" 0

# 4) 旧 pill 圆角
PILL=$(grep -rhoE "border-radius: ?(100|999)px" src/styles 2>/dev/null | wc -l | tr -d ' ')
check "旧 pill 圆角 (100/999px)" "${PILL:-0}" 0

# 5) Material 缓动
MAT=$(grep -rho "cubic-bezier(0.4, 0, 0.2, 1)" src/styles 2>/dev/null | wc -l | tr -d ' ')
check "Material 缓动 (0.4,0,0.2,1)" "${MAT:-0}" 0

echo
if [ "$fail" -eq 0 ]; then
  echo "UI guard ✓ 全部通过"
else
  echo "UI guard ✗ 有不变量被破坏——请用对应 design token 替换（见 UI_CONVENTIONS.md）"
fi
exit $fail
