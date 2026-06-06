# 云舟系统 · 考研养成核心

一个「系统绑定宿主」主题的考研游戏化养成应用。前身是单文件 HTML 原型（见 `design/goddess.html`），现已重构为 Next.js 项目：支持密码登录、云端 Postgres 进度同步、跨设备使用。

## 技术栈

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **Tailwind CSS v4**（自定义赛博主题在 `app/globals.css`）
- **zustand** 状态管理 + 防抖云端同步
- **Chart.js / react-chartjs-2** 雷达图与复盘图表
- **Vercel Postgres**（生产）/ 本地文件兜底（开发）
- 部署：**Vercel**

## 功能模块

智慧（高数/408/考研英语 可刷点，考研政治 9 月后解锁）、魅力（容貌细分+体态）、气质、体质、才艺（自定义）、每日必做（次日 0 点自动结算，漏做扣点）、核心任务（48h 死线 + 系统公告）、商城（抽奖+自定义兑换+背包投喂）、每日总结、周/月复盘（图表）、量子猫（拖拽/抚摸露肚皮/投喂进食/饥饿表情）、27 考研倒计时、每日运势、音效、改头像、改系统名。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3002 ，用密码登录（默认见 `.env.local` 的 `APP_PASSWORD`）。
开发环境无需数据库：状态会落到本地 `.data/state.json`（已 gitignore）。

环境变量（`.env.local`，已 gitignore）：

| 变量 | 说明 |
| --- | --- |
| `APP_PASSWORD` | 登录密码（单人使用） |
| `SESSION_SECRET` | 会话 cookie 的签名密钥，生产请用随机长串 |
| `POSTGRES_URL` | 存在时启用 Postgres；不存在则用本地文件兜底 |

## 部署到 Vercel

1. 安装并登录：`vercel login`（或在终端用 `! vercel login`）。
2. 首次部署：在项目根目录运行 `vercel`，按提示关联项目。
3. **挂载数据库**：Vercel 控制台 → 项目 → Storage → 创建 Postgres（Neon），它会自动注入 `POSTGRES_URL` 等环境变量。
4. **设置环境变量**：Project → Settings → Environment Variables，添加
   - `APP_PASSWORD`：你的登录密码
   - `SESSION_SECRET`：一段随机长字符串（如 `openssl rand -hex 32`）
5. 生产部署：`vercel --prod`。

部署后用手机和电脑分别登录，验证进度跨设备同步（状态存于 Postgres 单行 JSONB）。

## 数据与同步说明

- 整份应用状态以一个 JSON 对象存储（`app_state` 表单行 `data jsonb`）。
- 客户端挂载时拉取云端状态，编辑后约 0.8s 防抖写回。
- 每日结算、智慧衰减、48h 超时、宠物离线衰减均在**加载时按时间戳计算**，无需定时任务。
- 单人使用、单时刻一台设备，采用 last-write-wins。
