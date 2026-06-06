# Quality Guidelines

> Code quality standards for this project.

---

## Forbidden Patterns

| Pattern | Why | Instead |
|---------|-----|---------|
| `useStore()` without selector | Re-renders on every store mutation | Always pass selector: `useStore(s => s.data)` |
| Direct `state.currency +=` | Bypasses `todayStats` accounting | Use `earn(draft, n)` / `spend(draft, n)` |
| Direct `state.attrs[key] +=` | Bypasses clamping and `todayStats` | Use `adjustUnit(draft, key, n)` |
| `setInterval` / `setTimeout` for game logic | Time logic must be load-time only | Put all time logic in `settleAll()` |
| Storing derived values in `AppState` | Causes stale state bugs | Put in `lib/derive.ts` as pure functions |
| `any` type | Defeats TypeScript | Use proper types or `unknown` |
| Relative imports `../../lib/` | Fragile on refactor | Always use `@/lib/`, `@/components/` |
| API route with business logic | Hard to test, breaks separation | Delegate to `lib/` functions |

---

## Required Patterns

- **`"use client"` at top** of every component file (all components are client-side)
- **Selector per `useStore` call** — one selector per call, not destructured from one
- **All constants in `lib/model.ts`** — never hardcode game numbers in components
- **`@/` path alias** for all cross-directory imports
- **pnpm** for package management — never npm or yarn

---

## Code Style

- TypeScript strict mode — no implicit `any`
- ESLint configured (`eslint.config.mjs`) — run `pnpm lint` before commit
- No comments unless the "why" is non-obvious
- Chinese UI text is fine (it's a Chinese app), English for code identifiers

---

## Commit Standards

Every commit must:
- Build successfully (`pnpm build`)
- Pass lint (`pnpm lint`)
- Have a concise commit message in Chinese or English explaining the *why*
- Not push to remote (project policy: local commits only unless deploying)

---

## Pre-Dev Checklist

Before implementing a new feature:
1. Check `lib/model.ts` — does the constant already exist?
2. Check `lib/store.ts` — does the action already exist?
3. Check `lib/derive.ts` — does the derived value already exist?
4. Check `lib/state.ts` — does the type already exist?

Use `/trellis-before-dev` to load project conventions before coding.

---

## Deployment

```bash
vercel            # Preview deploy
vercel --prod     # Production deploy
```

Requires `APP_PASSWORD` and `SESSION_SECRET` env vars set in Vercel console. Postgres connection is injected automatically by Vercel Postgres integration.
