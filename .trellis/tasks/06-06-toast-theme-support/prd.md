# toast 公告及残余深色表面适配亮色模式

## Goal

亮色模式下仍有少量硬编码深色表面未适配，与浅色 UI 不协调。本任务以 toast 系统公告为主，一并清扫其余同类残余，使亮色模式无突兀深色块。

## What I already know

主题系统已就绪（`:root[data-theme="light"]` 变量覆盖 + 表面覆盖）。第一/二个任务已覆盖大部分表面（侧栏、卡片、输入、进度条、宠物等）。扫描后剩余未适配的硬编码深色表面：

| 选择器 | 行 | 原深色 | 可见场景 |
|--------|----|--------|----------|
| `.toast` | 166 | `#02040a` 白字 | 系统公告弹窗（用户明确要求） |
| `.log-screen` | 162 | `#020308` 绿字 | 每日总结/复盘日志输出 |
| `.bag-node` | 157 | `#010206` | 商城背包条目 |
| `.avatar-frame` | 66 | `#010206` | 侧栏头像框（未上传头像时露出） |

## Requirements

- [ ] 亮色模式下 `.toast` 改浅底深字，保留青色描边/发光
- [ ] 亮色模式下 `.log-screen` 改浅底（绿字保留，终端感）
- [ ] 亮色模式下 `.bag-node` 改浅底
- [ ] 亮色模式下 `.avatar-frame` 改浅底
- [ ] 暗色模式零回归

## Acceptance Criteria

- [x] 亮色模式下四处表面均为浅色调（toast 白底深字 / log-screen #eef3f8 绿字 / bag-node 浅底 / avatar-frame #dce6ef，实测通过）
- [x] 暗色模式下四处与改动前一致（toast #02040a / log #020308 / bag #010206 / avatar #010206 实测恢复，零回归）

## Implementation Notes

- 纯 CSS：`globals.css` 的 `:root[data-theme="light"]` 块追加 4 条 override。
- 验证教训：getComputedStyle 在「同一次 JS 调用内改 data-theme 再读」会因样式重算批处理拿到
  过渡中途/陈旧值（尤其元素带 transition）。需**分两次独立调用**（先改、后读）才得准确值。
- CSS 改动后仍需删整个 `.next` 重启 dev server 才重编译（沿用 pet 任务教训）。

## Definition of Done

- `tsc --noEmit` 通过（纯 CSS）
- 浏览器实测 toast + log-screen 亮/暗两态

## Technical Approach

仅修改 `app/globals.css`：在现有 `:root[data-theme="light"]` 块追加上述选择器覆盖，复用主题变量。

## Out of Scope

- `.binding-box` 登录/绑定前置遮罩（boot 屏，保留深色科幻感）

## Technical Notes

- `app/globals.css` 末尾 `:root[data-theme="light"]` 块 — 追加位置
- 验证关键：改完需删整个 `.next` 目录重启 dev server，CSS 才重编译（见 06-06-pet-theme-support 教训）
