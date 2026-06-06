# State Management

> Zustand global store, cloud sync, and settlement patterns.

---

## Architecture Overview

```
User action
    │
    ▼
useStore(s => s.someAction)(args)
    │
    ▼
store.ts: produce(draft => { mutate draft })  ← immer-style via zustand
    │
    ├─→ set({ data: nextState })   ← sync update to React
    │
    └─→ debouncedSave(nextState)   ← PUT /api/state (0.8s debounce)
                                         └─→ db.ts → Postgres / .data/state.json
```

---

## AppState Shape (`lib/state.ts`)

```typescript
interface AppState {
  version: number;
  // Identity
  hostName: string; age: number; gender: string;
  avatarBase64: string; systemName: string; petName: string;
  // Resources
  currency: number;
  // Attributes: all fixed unit keys (wisdom subjects + charm/temperament/physique)
  attrs: Record<string, number>;   // key → 0..MAX_POINT (100)
  talents: Talent[];               // custom talents
  // Tasks
  dailyTasks: DailyTask[];
  coreTasks: CoreTask[];
  lastDailySettleDate: string;     // YYYY-MM-DD
  lastWisdomActiveDate: string;
  // Shop
  shopItems: ShopItem[];
  inventory: Record<string, number>;
  // Pet
  petLove: number; petFood: number; lastPetSettle: number;
  // Logs / review
  todayDoneLogs: string[];
  historyDaily: DailyHistory[];
  todayStats: { attrGain: number; pointsEarned: number; pointsSpent: number };
  reviewLogs: string[];
  dailyFortune: string;
  announcements: string[];
}
```

---

## Store Structure (`lib/store.ts`)

The store holds `data: AppState | null` plus all domain actions as flat methods.

```typescript
// Pattern: all actions follow this shape
const useStore = create<StoreShape>()((set, get) => ({
  data: null,
  loadData: async () => { /* fetch + settleAll + set */ },
  grindSkill: (key: string) => set(produce(draft => {
    adjustUnit(draft.data!, key, SKILL_GRIND_STEP);
    // ... more mutations
  })),
}));
```

**Reading state in components:**
```typescript
// Selector — only re-renders when selected slice changes
const data = useStore((s) => s.data)!;
const grindSkill = useStore((s) => s.grindSkill);
```

**Never** read the whole store without a selector — causes re-renders on every action.

---

## Private Helpers in store.ts

| Helper | Purpose |
|--------|---------|
| `adjustUnit(draft, key, n)` | Clamp and apply delta to `attrs[key]` or `talents[id]`, updates `todayStats.attrGain` |
| `earn(draft, n)` | Add currency + update `todayStats.pointsEarned` |
| `spend(draft, n)` | Deduct currency, returns `false` if insufficient |
| `mathCombo(draft)` | Check if gaoshu + xiandai combo threshold is met |

Always use these helpers instead of directly mutating `currency` or `attrs` — they keep `todayStats` in sync.

---

## Settlement (`lib/settle.ts`)

`settleAll(state)` is called once at load time. It handles all time-based transitions:
- Daily settlement (task penalty, daily reset) if `lastDailySettleDate !== today`
- Wisdom decay if no study yesterday
- Core task overdue check
- Pet offline decay based on `lastPetSettle` timestamp

**Never** add timers or `setInterval` — all time logic must live in `settleAll`.

---

## Cloud Sync

- Sync is triggered by any state mutation via a 800ms debounce
- `PUT /api/state` — full state JSON, last-write-wins
- No optimistic updates, no conflict resolution
- Dev: writes to `.data/state.json`; Prod: writes to Postgres row

---

## Derived Values (`lib/derive.ts`)

Pure functions of `AppState`, never stored in state:

```typescript
wisdomLevel(state: AppState): number   // total wisdom / 50
wisdomTotal(state: AppState): number   // sum of all wisdom attr points
```

Add new derived values here, not to `AppState`.

---

## Common Mistakes

- **Mutating `currency` or `attrs` directly** — always use `earn/spend/adjustUnit` helpers
- **Adding derived values to AppState** — put them in `derive.ts` instead
- **Using `useStore()` without selector** — always pass a selector to avoid unnecessary re-renders
- **Adding timers for time logic** — all time-based logic belongs in `settleAll()`
