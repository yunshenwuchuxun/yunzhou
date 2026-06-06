# 顶部栏内容右对齐

## Goal

TopBar（`.top-navbar`）当前用 `justify-content: space-between`，倒计时/运势/积分按钮左右铺开。
按用户要求改为整体内容靠右对齐。

## Requirements

- [ ] `.top-navbar` 内容（倒计时 / 今日运势 / 积分按钮组）整体右对齐
- [ ] 移动端 flex-wrap 换行行为不破坏

## Acceptance Criteria

- [x] 顶部栏三组内容靠右成组排列（实测 justify-content:flex-end，右边缘对齐内边距）
- [x] 暗/亮模式均正常

## Technical Approach

仅改 `app/globals.css:86` 的 `.top-navbar`：`justify-content: space-between` → `flex-end`。

## Out of Scope

- 顶部栏内各元素顺序/样式不变

## Technical Notes

- `app/globals.css:86` — `.top-navbar` 规则
- 验证：改 CSS 后删 `.next` 重启 dev server 再看（沿用既往教训）
