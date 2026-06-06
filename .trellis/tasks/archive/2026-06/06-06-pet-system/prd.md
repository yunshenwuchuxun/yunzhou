# brainstorm: 宠物系统与多端/协作完善

## Goal

四条诉求合并推进：(1) 把单一「量子猫」升级为**可选/可玩的宠物系统**，先设计 5 种横跨「可爱↔霸气」的宠物供选择，并设计有趣的玩法功能；(2) README 加入 Vercel 一键部署按钮；(3) 兼容手机端；(4) 配置 GitHub 协作权限——给 yunhou242@gmail.com 写权限、保护 main 分支、强制 PR、owner 审核后合并。

## What I already know（现状）

- **宠物**：单一硬编码「量子猫 AI-CAT-01」，纯 CSS 绘制（`globals.css` `.cat-mesh`/`.cat-head`/`.cat-tail`/腿 + `@keyframes` 行走/躺卧/露肚皮/进食/悲伤）。`CyberCat.tsx` 含运动引擎、拖拽、自主独白、信号响应（stroke/eat/cheer）。`state.ts` 有 `petName`/`petLove`/`petFood`/`lastPetSettle`，**无 `petType`/物种字段**。
- **手机端**：`globals.css:60` `@media(max-width:820px)` 直接 `.sidebar{display:none}` → 手机无导航；`@media(max-width:1100px)` 网格折单列。弹窗/绑定框已用 `max-width:92vw`。`layout.tsx` viewport 待确认。
- **README**：已有「部署到 Vercel」手动章节，无一键 Deploy Button。
- **GitHub**：remote `github.com/yunshenwuchuxun/yunzhou`，`gh` 已登录 owner `yunshenwuchuxun`。

## Assumptions (temporary)

- 宠物系统沿用纯 CSS 绘制风格（与现有量子猫一致），不引入图片/Lottie 资源，保持轻量。
- 多宠物为「单宠物可切换」而非同屏多只（避免遮挡与性能问题）。
- README 一键部署用官方 `https://vercel.com/new/clone?repository-url=...` badge，并声明需手动挂 Postgres + 设环境变量。
- item 4 的 yunhou242@gmail.com 走 GitHub API 邮箱邀请为 collaborator（push 权限），分支保护用 classic branch protection rule（要求 PR + 1 审核 + 禁止直推 main）。

## Decisions（已确认）

- **宠物系统深度**：全都要，**分阶段** —— Phase 1 切换 → Phase 2 图鉴收集 → Phase 3 进化成长。
- **MVP 首批宠物（4 只，完整形象+动画+专属玩法）**：量子猫（现有升级）、机甲熊猫、赤焰小龙、机械狼。凤凰·涅槃 / 浮游水母留作后续阶段（图鉴/进化阶段补入）。
- Phase 1 假设：4 只全部直接可切换（解锁条件留到 Phase 2 图鉴一起做）。
- **移动端导航**：抽屉式汉堡菜单 —— 顶栏加汉堡按钮，点击从左滑入现有 Sidebar（带遮罩），复用整块 Sidebar，改动最小。
- **GitHub 分支保护**：要求 PR + 1 审核 + 禁止直推 main，**不勾 enforce_admins**（owner 可直推应急，仅约束协作者）；邀请 yunhou242@gmail.com 为 collaborator（push 权限）。

## Requirements

**WS-A 宠物系统（分阶段）**
- [x] Phase 1：`state.ts` 新增 `petType` 字段（默认 `quantum-cat`）+ migrate 兼容；`CyberCat` 按 `petType` 渲染 4 套形象/动画（量子猫/机甲熊猫/赤焰小龙/机械狼）；交互枢纽加切换入口；4 只直接可切换 → commit 45b731d
- [x] Phase 1：专属玩法（务实范围）—— 四只角色化文案池 + 专属彩带配色 + 狼(临近死线催战)/熊猫(每日必做督促)签名反应 → commit f447c5c
- [~] Phase 1 推迟项（需新子系统）：猫=番茄钟专注陪跑、龙=连击双倍积分时段、狼群 buff（留作后续）
- [ ] Phase 1 体验补强（用户追加）：①常驻快捷切换按钮（不必点开枢纽即可换宠物，切换器从 hub 移到常驻控件）；②宠物拖拽后停在放置位置（不瞬移回固定点）+ 自主行为改为小范围游走 + 不定时轻跳跃；③宠物可隐藏/显示（持久化 `petHidden`，隐藏后留一个小入口可重新唤出）
- [ ] Phase 2：宠物图鉴（已解锁/解锁条件）+ 解锁机制；补入凤凰·涅槃
- [ ] Phase 3：进化成长（连续打卡/宿主等级 → 形态进化）；补入浮游水母

**WS-B README 一键部署**
- [x] README 顶部加官方 `vercel.com/new/clone` Deploy Button + 说明 → commit 2b91a76

**WS-C 移动端**
- [x] 抽屉式汉堡导航（≤820px）+ 遮罩 + 点击切换面板自动收起 → commit 2b91a76
- [x] `layout.tsx` 补 viewport meta；移动端收窄 padding，无横向溢出

**WS-D GitHub 协作**
- [x] main 分支保护：要求 PR + 1 审核 + 禁止直推 + 禁强推，不勾 enforce_admins（已通过 gh api 生效）
- [ ] 邀请 yunhou242@gmail.com 为 collaborator —— **阻塞**：个人仓库协作者 API 只认 GitHub 用户名，邮箱搜不到，待用户提供用户名

## Acceptance Criteria

- [ ] 4 种宠物可在设置面板内切换并正确渲染各自形态/动画与专属玩法
- [ ] README 顶部「Deploy with Vercel」按钮可点击并跳转 clone 流程
- [ ] 手机浏览器（≤480px）可经汉堡菜单访问全部 10 个面板与核心操作，无横向溢出
- [ ] main 分支无法被协作者直推，PR 需 owner 审核方可合并，yunhou242 拥有 push 权限
- [ ] lint / typecheck / build 全绿

## Decision (ADR-lite)

**Context**: 单宠物→多宠物、移动端不可用、缺一键部署、需引入协作审核流。
**Decision**: 宠物分三阶段（切换→图鉴→进化），MVP 先做 4 只纯 CSS 渲染可切换；移动端用抽屉复用 Sidebar；README 加官方 clone badge；GitHub 用 classic 分支保护，owner 不受 enforce_admins 限制。
**Consequences**: 纯 CSS 多宠物渲染需为每只写独立 mesh+keyframes（工作量集中在 CSS）；分阶段可增量交付、先跑起来；owner 保留应急直推但需自律走 PR。

## Definition of Done (team quality bar)

- 类型安全、lint/typecheck 通过、build 绿
- 移动端真机/模拟器验证
- README 变更后渲染正确
- GitHub 配置以 `gh` 验证生效

## Out of Scope (explicit)

- 同屏多宠物、宠物对战、付费/抽卡获取宠物
- 移动端 PWA / 原生封装
- 多人协作的实时状态同步（仓库协作 ≠ 应用多用户）

## Technical Notes

- 宠物渲染：`components/CyberCat.tsx` + `app/globals.css`（`.cat-mesh` 体系）；文案 `lib/content.ts`；状态 `lib/state.ts`/`lib/store.ts`。
- 移动端：`app/globals.css` 媒体查询、`app/layout.tsx` viewport、`components/Sidebar.tsx`。
- 一键部署：README.md + `vercel.com/new/clone` query。
- GitHub：`gh api` 邀请 collaborator + branch protection（owner=yunshenwuchuxun，repo=yunzhou）。
