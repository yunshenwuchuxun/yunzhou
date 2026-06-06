# Directory Structure

> How code is organized in this project.

---

## Directory Layout

```
yunzhou/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Main app entry (renders panels via Sidebar)
│   ├── login/page.tsx          # Password login page
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   └── api/
│       ├── auth/route.ts       # POST login / DELETE logout
│       └── state/route.ts      # GET pull state / PUT save state
│
├── components/
│   ├── panels/                 # View panels (one per sidebar nav item)
│   │   ├── WisdomPanel.tsx     # 认知矩阵 — wisdom attributes + radar chart
│   │   ├── AttrPanels.tsx      # 魅力/气质/体质 panels
│   │   ├── TalentPanel.tsx     # 才艺 panel (custom talents)
│   │   ├── DailyTaskPanel.tsx  # 每日必做 tasks
│   │   ├── CoreTaskPanel.tsx   # 核心契约 tasks (48h deadline)
│   │   ├── ShopPanel.tsx       # 商城 (gacha + custom redemption)
│   │   ├── SummaryPanel.tsx    # 每日总结
│   │   └── ReviewPanel.tsx     # 周/月复盘
│   ├── CyberCat.tsx            # 量子猫 draggable pet widget
│   ├── Sidebar.tsx             # Navigation menu (10 view entries)
│   ├── TopBar.tsx              # Countdown, fortune, currency, actions
│   ├── RadarChart.tsx          # Chart.js radar chart wrapper
│   ├── ReviewCharts.tsx        # Bar/line charts for review data
│   ├── Starfield.tsx           # Canvas star background animation
│   └── Toast.tsx               # Notification toast system
│
├── lib/
│   ├── model.ts                # Domain constants (subjects, attr keys, tasks)
│   ├── state.ts                # AppState type + createDefaultState + migrateState
│   ├── store.ts                # Zustand store + all domain actions
│   ├── settle.ts               # Time-based settlement logic (runs at load)
│   ├── derive.ts               # Pure derived computations (levels, totals)
│   ├── db.ts                   # Persistence layer (Postgres / JSON file)
│   ├── auth.ts                 # JWT session helpers
│   ├── content.ts              # Game text content (announcements, fortunes)
│   ├── audio.ts                # Sound effect utilities
│   └── util.ts                 # Generic utils (dateStr, clamp, uid)
│
├── design/
│   └── goddess.html            # Original single-file HTML prototype (reference only)
│
├── public/                     # Static assets
├── .trellis/                   # Trellis workflow config
├── .data/                      # Dev-only state storage (gitignored)
│   └── state.json
└── .env.local                  # Local env vars (not committed)
```

---

## Module Organization

- **`lib/`** is the backend of the frontend — all business logic lives here, zero UI
- **`components/panels/`** maps 1:1 to sidebar views; each panel is self-contained
- **`components/`** (root) holds layout/shared UI components used across multiple views
- **`app/api/`** is thin: no business logic, delegates to `lib/`

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `WisdomPanel.tsx` |
| Lib files | kebab-case | `state.ts`, `settle.ts` |
| API routes | `route.ts` in folder | `app/api/state/route.ts` |
| CSS variables | `--kebab-case` | `var(--primary)`, `var(--purple)` |
| State action keys | camelCase | `grindSkill`, `toggleDailyTask` |

---

## New Feature Checklist

1. Domain type → add to `lib/state.ts` (`AppState` interface + `createDefaultState`)
2. Constants → add to `lib/model.ts`
3. Actions → add to `lib/store.ts` (operate on `draft` via immer)
4. Derived values → add to `lib/derive.ts` (pure functions of `AppState`)
5. UI → add panel to `components/panels/`, register in `Sidebar.tsx` + `app/page.tsx`
