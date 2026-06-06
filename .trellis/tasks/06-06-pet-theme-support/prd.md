# 宠物组件适配亮暗色模式

## Goal

量子猫（CyberCat）的本体、语音气泡、互动面板、猫碗当前用硬编码深色，在亮色模式下与浅色 UI 不协调。让宠物相关元素随主题自动适配，保持赛博朋克风格一致。

## What I already know

- 主题系统已就绪：`globals.css` 的 `:root[data-theme="light"]` 块覆盖变量 + 部分深色表面
- CyberCat 组件无内联硬编码颜色，全部由 CSS 类驱动 → 改动集中在 `globals.css`
- 宠物相关硬编码深色：
  - `.cat-torso` / `.cat-head` → `background: #090e26`（猫身/头填充）
  - `.pet-bubble` → `background: #02040a; color: #fff`（语音气泡）
  - `.pet-hub` → `background: rgba(5, 7, 20, 0.96)`（互动面板）
  - `.cat-bowl` → `background: #1a1f3a`（猫碗）
- 已随主题适配的部分：眼睛 `var(--green)`、腿/尾/边框 `var(--primary)`（变量已切换）

## Requirements

- [ ] 亮色模式下宠物本体填充改为浅色，保留青色描边与发光（仍可辨识为同一只猫）
- [ ] 亮色模式下语音气泡改为浅底深字
- [ ] 亮色模式下互动面板 `.pet-hub` 改为浅色面板
- [ ] 亮色模式下猫碗改为浅色
- [ ] 暗色模式视觉完全不变（零回归）

## Acceptance Criteria

- [x] 切到亮色模式，量子猫本体/气泡/面板/猫碗均为浅色调（torso/head #e3edf5、hub/bubble 白底，实测通过）
- [x] 切回暗色模式，宠物外观与改动前一致（torso #090e26、hub rgba(5,7,20)、bubble #02040a 实测恢复，零回归）

## Implementation Notes

- 纯 CSS：仅在 `globals.css` 的 `:root[data-theme="light"]` 块追加 4 条宠物 override。
- **关键坑**：运行中的 dev server 文件监听失效，且 `.next` 构建缓存顽固——删 `.next/cache`
  不够，必须删整个 `.next` 目录重启，新增 CSS 才会重新编译进 served stylesheet。
  排查手段：浏览器 `document.styleSheets` 枚举确认 override 规则是否真的被服务。

## Definition of Done

- `pnpm tsc --noEmit` 通过（本次纯 CSS，无类型影响）
- 浏览器实测亮/暗两种模式宠物外观

## Technical Approach

仅修改 `app/globals.css`：在现有 `:root[data-theme="light"]` 块追加宠物相关选择器覆盖，
复用主题变量（`--panel-bg` / `--text-main`），不新增组件逻辑、不改 CyberCat.tsx。

## Out of Scope

- `.toast` 系统公告的深色（非宠物组件，另议）
- 宠物动画/交互行为变更

## Technical Notes

- `app/globals.css:171-216` — 宠物相关 CSS 区块
- `app/globals.css` 末尾 `:root[data-theme="light"]` — 亮色覆盖块，追加位置
- `components/CyberCat.tsx` — 无需改动（无内联颜色）
