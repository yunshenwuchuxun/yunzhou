# Frontend Development Guidelines

> Best practices for frontend development in this project.

---

## Project Overview

**云舟系统** is a gamified study companion app for graduate school exam prep (考研). Users manage study progress, attributes, daily/core tasks, and interact with a virtual pet (量子猫). Built with Next.js App Router + Zustand + Tailwind CSS v4, deployed on Vercel.

---

## Guidelines Index

| Guide | Description |
|-------|-------------|
| [Domain Model](./domain-model.md) | Game mechanics, attributes, tasks, constants |
| [Directory Structure](./directory-structure.md) | Module organization and file layout |
| [Component Guidelines](./component-guidelines.md) | Component patterns, props, composition |
| [Hook Guidelines](./hook-guidelines.md) | Custom hooks, data fetching patterns |
| [State Management](./state-management.md) | Zustand store, actions, cloud sync |
| [Quality Guidelines](./quality-guidelines.md) | Code standards, forbidden patterns |
| [Type Safety](./type-safety.md) | TypeScript patterns, AppState types |

---

## Pre-Development Checklist

Before writing any code:
- [ ] Read [Domain Model](./domain-model.md) — does the constant/mechanic already exist in `lib/model.ts`?
- [ ] Read [State Management](./state-management.md) — does the action already exist in `lib/store.ts`?
- [ ] Check `lib/derive.ts` — is the derived value already computed?
- [ ] Check [Directory Structure](./directory-structure.md) — where does this new code belong?

## Quality Check

Before committing:
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] Used `@/` path alias (no `../../`)
- [ ] Store mutations use `adjustUnit/earn/spend` helpers
- [ ] No new `setInterval`/timers added
- [ ] New persisted fields added to `createDefaultState` in `lib/state.ts`

---

## Key Constraints

- **Single-user app** — no multi-user auth, no real-time sync between devices
- **Last-write-wins** — only one device at a time; state is PUT to `/api/state` with 0.8s debounce
- **Time-based settlement** — no cron jobs; all time-dependent logic runs at load time via `settleAll()`
- **Dev vs Prod storage** — local dev uses `.data/state.json`; production uses Vercel Postgres (Neon)
