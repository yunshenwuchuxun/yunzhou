# 宠物鼓励加油功能

## Goal

让量子猫能针对宿主的学习行为主动「鼓励加油」，形成即时正反馈，增强陪伴感与坚持动力。

## What I already know（现状）

- 猫已有自主独白：每 12s 随机说 `CAT_DIALOGUES`（含部分激励语）；`petFood<25` 说饥饿语、`petLove<30` 说孤独语（`CyberCat.tsx` 第97-103行）
- 猫响应交互信号：`signalCat({type})` → stroke 露肚皮+❤️+彩带、eat 咀嚼+食物碗（`CyberCat.tsx` 第165-185行）
- 气泡 `say(text)` 显示 3.5s（第37-42行）；`pushToast` 顶部公告
- 文案集中在 `lib/content.ts`（`CAT_DIALOGUES` / `CAT_HUNGRY` / `CAT_LONELY` / `announceTaskDone`）
- **缺口**：没有针对学习行为（完成任务/刷点/突破）的主动鼓励，没有专门的鼓励语料池

## Decisions（已确认）

- **触发场景（四个全要）**：完成任务（每日必做 / 核心契约）、刷技能点（含才艺精进）、达成里程碑、主动求鼓励
- **呈现形式**：气泡（`say`）+ 彩带特效（`confetti`）
- **节流策略**：
  - 刷技能点 → 随机间歇触发（~25% 概率），避免每次点击都刷屏；普通彩带
  - 完成任务 → 每次都给普通彩带
  - 达成里程碑（属性跨越 25/50/75/100 阈值 / 数学连携解锁）→ 每次都给「加强版」多段彩带
  - 主动求鼓励（交互枢纽新增按钮）→ 每次都给加强版彩带

## Requirements

- [x] 新增鼓励语料池 `CAT_ENCOURAGEMENTS` + 里程碑文案 `CAT_MILESTONE` / `CAT_COMBO_UNLOCK`（`lib/content.ts`）
- [x] 扩展 `CatSignal` 增加 `cheer` 类型，携带 `text` 与 `big` 字段
- [x] `CyberCat` 响应 `cheer`：`say(text)` + 彩带（`big` 时多段加强）
- [x] store 触发点接入：`completeCoreTask`（含数学连携解锁里程碑）/ `toggleDaily` / `grindSkill` / `grindTalent`（含跨阈值里程碑+25%节流）+ 新增 `cheerMe` action
- [x] 交互枢纽新增「✨ 求鼓励」按钮
- [x] 复用现有 `signalCat` / `say` / pet-bubble / confetti 架构，避免重复造轮子

## Technical Notes

- `components/CyberCat.tsx` — 状态机、气泡、signal 响应
- `lib/store.ts` — `signalCat`、`grindSkill`、`completeCoreTask`、`toggleDailyTask` 等触发点
- `lib/content.ts` — 文案池
