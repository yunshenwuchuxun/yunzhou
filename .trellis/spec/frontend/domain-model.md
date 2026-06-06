# Domain Model

> Game mechanics and domain constants for 云舟系统.

---

## Attribute System

All attributes are stored in `AppState.attrs` as `Record<string, number>` (0–100, see `MAX_POINT`).

### Wisdom (智慧) — `lib/model.ts: WISDOM_SUBJECTS`

| Key | Subject | Notes |
|-----|---------|-------|
| `gaoshu` | 高等数学 | Part of math combo |
| `xiandai` | 线性代数 | Part of math combo |
| `shuju` | 数据结构 | 408 |
| `jizu` | 计算机组成 | 408 |
| `os` | 操作系统 | 408 |
| `wangluo` | 计算机网络 | 408 |
| `yingyu` | 考研英语 | |
| `zhengzhi` | 思想政治理论 | Unlocked after Sept 1 (`isZhengzhiUnlocked()`) |

### Non-Wisdom Fixed Attributes — `lib/model.ts: NON_WISDOM_KEYS`

**魅力 (Charm):** `eyes`, `voice`, `hair`, `skin`, `complexion`, `posture`
**气质 (Temperament):** `emotion`, `logic`, `speech`, `knowledge`, `observation`
**体质 (Physique):** `sleep`, `diet`, `habit`, `exercise`

### Talents (才艺)

Custom user-defined talents stored as `Talent[]`. Skill key format: `"talent:<id>"`.

---

## Skill Grinding

- `grindSkill(key)` in store — adds `SKILL_GRIND_STEP` points to the attribute
- **Math combo bonus**: if `gaoshu >= COMBO_THRESHOLD && xiandai >= COMBO_THRESHOLD`, wisdom grinding gives extra rewards
- **Wisdom active tracking**: `lastWisdomActiveDate` — used for decay if user skips a day

---

## Task System

### Daily Tasks (`DailyTask[]`)
- 12 built-in tasks defined in `BUILTIN_DAILY_TASKS` (`lib/model.ts`)
- Each task has `attrKey` (which attribute it's linked to) and `penalty` flag
- Completing: +`DAILY_TASK_GAIN` attr points + `DAILY_TASK_REWARD` currency
- Missing (`penalty: true`): `-3` attr points on daily settlement

### Core Tasks (`CoreTask[]`)
- User-created "contracts" with 48-hour deadline (`createdTs + 48h`)
- `mode: "normal"` → 10 currency reward; `mode: "gamble"` → 25 currency (higher risk)
- `isOverdue: true` set by `settleAll()` when deadline passed and task incomplete

---

## Daily Settlement (`settleAll`)

Runs once at app load if `lastDailySettleDate !== today`:
1. Apply penalties for unfinished penalty tasks
2. Archive `todayStats` to `historyDaily`
3. Reset `todayDoneLogs`, `todayStats`, `lastDailySettleDate`
4. Re-generate daily fortune (`dailyFortune`)
5. Check wisdom decay (if `lastWisdomActiveDate` was >1 day ago)
6. Mark overdue core tasks

---

## Pet System

- **petLove** (0–100): increases on stroke/feed, decays offline
- **petFood** (0–100): increases on feed, decays offline
- **lastPetSettle**: Unix timestamp of last decay calculation
- Decay is calculated in `settleAll()` based on elapsed time since `lastPetSettle`

---

## Currency (积分)

| Source | Amount |
|--------|--------|
| Complete daily task | +`DAILY_TASK_REWARD` (5) |
| Complete normal core task | +10 |
| Complete gamble core task | +25 |
| Math combo wisdom grind | +2 bonus |
| Weekly/monthly review | varies |

| Spend | Amount |
|-------|--------|
| Gacha draw | -20 |
| Custom shop redemption | -item.price |

---

## Key Constants (`lib/model.ts`)

| Constant | Value | Meaning |
|----------|-------|---------|
| `MAX_POINT` | 100 | Max value for any attribute |
| `SKILL_GRIND_STEP` | (see model.ts) | Points gained per grind click |
| `DAILY_TASK_GAIN` | (see model.ts) | Attr points for completing a daily task |
| `DAILY_TASK_REWARD` | 5 | Currency for completing a daily task |
| `COMBO_THRESHOLD` | (see model.ts) | gaoshu+xiandai threshold for combo activation |
