# Type Safety

> TypeScript patterns in this project.

---

## Type Organization

| Location | What lives here |
|----------|----------------|
| `lib/state.ts` | All persisted data types (`AppState`, `Talent`, `DailyTask`, `CoreTask`, `ShopItem`, `DailyHistory`) |
| `lib/model.ts` | Domain constants + type-narrowing helpers (`isZhengzhiUnlocked`) |
| `lib/store.ts` | Store shape type (inline, not exported) |
| `lib/derive.ts` | Return types of derived computations |
| Component files | Local prop types (inline, not exported) |

**Single source of truth**: `AppState` in `lib/state.ts` is the canonical shape of all persisted data. Never duplicate type definitions.

---

## Key Types

```typescript
// lib/state.ts
interface AppState { ... }      // Full persisted state
interface Talent { id, name, points }
interface DailyTask { id, name, attrKey, penalty, builtin, done }
interface CoreTask { id, text, attrKey, mode, completed, isOverdue, createdTs }
interface ShopItem { id, name, desc, price }
interface DailyHistory { date, attrGain, pointsEarned, pointsSpent }
```

---

## Common Patterns

**Null check on store data** (data is `null` until loaded):
```typescript
const data = useStore((s) => s.data)!;  // Non-null assertion — safe after mount
```

**`attrKey` can be a talent reference:**
```typescript
// key is either a fixed attr key like "gaoshu" or "talent:42"
const isTalent = (key: string) => key.startsWith("talent:");
const talentId = Number(key.slice(7));
```

**State version migration:**
```typescript
// lib/state.ts: migrateState handles version upgrades
// Always increment STATE_VERSION when adding required fields to AppState
```

---

## Forbidden Patterns

- `as any` — use proper types or `as unknown as T` with a comment explaining why
- Widening `AppState` fields to `unknown` or `object` — keep everything typed
- Defining the same domain type in multiple files — always import from `lib/state.ts`
- Ignoring TypeScript errors with `// @ts-ignore` — fix the types instead

---

## No Runtime Validation

This project does **not** use Zod or any schema validation library. The API routes trust the shape of state because it's a single-user app with no external API consumers. If you add a public-facing API endpoint, add Zod validation at that boundary.
