# Hook Guidelines

> How hooks are used in this project.

---

## Overview

This project uses **no custom hooks** — all stateful logic lives in the Zustand store (`lib/store.ts`). Components read from the store via selectors and call store actions directly.

There is **no React Query or SWR** — data fetching is done once at app startup via `store.loadData()`.

---

## Primary Pattern: Zustand Selectors

```typescript
// Read data slice — re-renders only when this slice changes
const data = useStore((s) => s.data)!;

// Read an action — stable reference, never causes re-renders
const grindSkill = useStore((s) => s.grindSkill);
const toggleDailyTask = useStore((s) => s.toggleDailyTask);
```

Always use separate `useStore` calls per selector — don't destructure from one call.

---

## Data Fetching

Data is fetched **once** when the app mounts, in `app/page.tsx`:

```typescript
useEffect(() => {
  store.loadData();   // GET /api/state → settleAll → set store
}, []);
```

No polling, no refetching, no cache invalidation. The store is the single source of truth after initial load.

---

## Local UI State

Use `useState` for local transient UI state that doesn't need to persist:
- Modal open/close
- Input field values before submit
- Hover/animation states
- Form validation messages

```typescript
const [isEditing, setIsEditing] = useState(false);
const [inputVal, setInputVal] = useState("");
```

Do **not** lift local UI state to the Zustand store.

---

## When to Create a Custom Hook

Currently, no custom hooks exist. Create one only if:
1. The same `useStore` selector + local state combination appears in 3+ components
2. The logic is non-trivial enough to test independently

Name custom hooks `use[Domain][What]`, e.g., `useWisdomProgress`.

---

## Common Mistakes

- **`useEffect` for derived values** — compute derived values from `data` during render, not in effects
- **`useEffect` for store mutations** — call store actions directly in event handlers, never in effects
- **Stale closure over store actions** — always read actions via selector, don't capture them in `useEffect` deps
