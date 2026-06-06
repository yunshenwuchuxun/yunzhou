# 配置面板 + 亮色模式

## Goal

在 TopBar 右侧增加两个小按钮（☀️/🌙 主题切换、⚙️ 配置），让用户可一键切换亮/暗色主题，并通过配置面板统一管理身份与系统信息。

## Requirements

- [ ] TopBar 右侧增加 ☀️/🌙 主题切换按钮（与现有音效按钮并排）
- [ ] TopBar 右侧增加 ⚙️ 配置按钮
- [ ] 点击 ⚙️ 弹出配置模态面板
- [ ] 配置面板可编辑：`hostName`、`age`、`gender`、`systemName`、`petName`、头像上传
- [ ] 配置面板使用显式「保存」按钮，支持取消
- [ ] 亮色模式：浅灰/白底，保留青色/紫色主题色和网格背景（赛博朋克浅色版）
- [ ] 主题偏好持久化到 `localStorage`（设备级，不同步云端）
- [ ] Sidebar 中 `systemName` 内联编辑整合到配置面板，移除冗余入口
- [ ] 字段校验：`hostName` 不能为空，`age` 需为合法数字

## Acceptance Criteria

- [x] TopBar 右侧显示三个小按钮：音效 | 主题 | 配置
- [x] 点击 ☀️/🌙，页面颜色立即切换，刷新后保持（localStorage 验证通过）
- [x] 点击 ⚙️，弹出配置面板，显示当前所有字段值（portal 居中验证通过）
- [x] 修改字段后点「保存」，数据同步云端（state.json petName 验证通过）；点「取消」无效果
- [x] 空 `hostName` 或非法 `age` 时，「保存」按钮禁用并提示（验证通过）
- [x] Sidebar 用户卡片不再有 `systemName` 内联编辑（已移除）

## Implementation Notes

- 关键问题：modal 的 `position:fixed` 被带 `backdrop-filter` 的祖先（`.main-content`）困住，
  导致定位相对父容器而非视口。用 `createPortal(modal, document.body)` 解决。
- 亮色模式集中在 `globals.css` 的 `:root[data-theme="light"]` 块（变量覆盖 + 少量硬编码深色表面覆盖），
  零风险不影响暗色模式。
- 防 FOUC：`layout.tsx` 首屏内联脚本读 localStorage 注入 `data-theme`，配 `suppressHydrationWarning`。
- 浏览器端到端验证全部通过（Chrome DevTools MCP）。

## Definition of Done

- Lint / typecheck 通过（`pnpm lint && pnpm build`）
- 亮色/暗色两种模式下 UI 无明显对比度问题

## Technical Approach

**主题系统：**
- `app/globals.css` 新增 `[data-theme="light"] { --bg-dark: #f0f4f8; --panel-bg: ...; ... }` 覆盖块
- `app/layout.tsx` SSR 阶段通过内联 `<script>` 读取 localStorage 注入 `data-theme`（避免 FOUC）
- TopBar 本地 state 管理当前主题，切换时写 localStorage + 更新 `document.documentElement.dataset.theme`

**配置面板：**
- 新建 `components/ConfigModal.tsx` — 受控表单，本地 state 暂存编辑中的值
- `lib/store.ts` 新增 `setGender(g: string)` action
- 保存时批量调用现有 actions：`bind`, `setAvatar`, `renameSystem`, `renamePet`, `setGender`
- `components/Sidebar.tsx` 移除 `systemName` 点击编辑逻辑

## Decision (ADR-lite)

**Context**: 主题偏好是设备/个人习惯，不属于游戏存档数据
**Decision**: 主题存 localStorage，不进 AppState，不同步云端
**Consequences**: 换设备需重新选择主题；实现简单，不污染游戏状态

## Out of Scope

- 考研目标日期自定义（未来扩展）
- 通知/提醒设置
- 多套主题（仅做亮/暗两种）

## Technical Notes

- `app/globals.css:3-17` — 现有 CSS 变量定义位置
- `app/layout.tsx` — `<html>` 元素，需加内联脚本防 FOUC
- `components/TopBar.tsx` — 按钮区域在 `.top-currency` div 内
- `lib/store.ts` — 缺 `setGender` action，其余 actions 已有
- `components/Sidebar.tsx` — `systemName` 内联编辑在 host-card 区域，实现后移除
