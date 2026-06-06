# Component Guidelines

> How components are built in this project.

---

## Component Structure

All components use the standard React function component pattern with `"use client"` directive (all components are client-side).

```typescript
"use client";
import { useStore } from "@/lib/store";
import { MODEL_CONSTANT } from "@/lib/model";

export default function SomePanel() {
  const data = useStore((s) => s.data)!;
  const someAction = useStore((s) => s.someAction);

  // Local UI state (not persisted)
  const [localState, setLocalState] = useState(false);

  return (
    <div className="view-panel">
      <div className="panel-title">Panel Title</div>
      {/* content */}
    </div>
  );
}
```

---

## Panel Components (`components/panels/`)

Each panel maps to one sidebar view. Conventions:
- Default export, no props — reads everything from `useStore`
- Top-level wrapper: `<div className="view-panel">`
- Title: `<div className="panel-title">emoji + name</div>`
- Cards inside: `<div className="panel-card">`
- Grid layout: `<div className="dashboard-grid">` for 2-column layouts

---

## Shared/Layout Components

| Component | Usage |
|-----------|-------|
| `Sidebar` | Navigation — passes current view + setter down |
| `TopBar` | Always visible header — reads store directly |
| `CyberCat` | Draggable pet — manages own position state locally |
| `Toast` | Imperative toast — called via `useStore(s => s.addToast)` |
| `RadarChart` | Stateless chart wrapper — receives `labels`, `data`, `max` props |
| `ReviewCharts` | Stateless — receives `historyDaily` prop |
| `Starfield` | Pure animation — no props, no state from store |

---

## Styling Patterns

This project uses **Tailwind CSS v4** mixed with **inline styles** for dynamic values and **CSS custom properties** for theming.

**CSS variables (defined in global CSS):**
```css
var(--primary)    /* cyan #00d4ff */
var(--purple)     /* purple accent */
var(--green)      /* success green */
var(--bg)         /* dark background */
```

**Tailwind for layout/spacing**, inline `style={{}}` for dynamic widths, colors based on state:
```tsx
// Dynamic width via inline style
<div className="progress-bar" style={{ width: `${pct}%` }} />

// Conditional color via CSS var
<div style={{ color: isActive ? "var(--green)" : "var(--primary)" }}>
```

**Predefined CSS classes** (from global CSS, not Tailwind):
- `.view-panel` — scrollable panel container
- `.panel-title` — section header
- `.panel-card` — glassmorphism card
- `.dashboard-grid` — 2-column responsive grid
- `.progress-track` / `.progress-bar` — progress bar
- `.muted` — dimmed text
- `.combo-box` — special highlight box

**Do not** add Tailwind classes where a predefined CSS class already exists.

---

## Props Conventions

- **Panel components have no props** — they read from the global store directly
- **Chart components are stateless** — pass data as props, no store reads inside
- **Shared UI components** (Toast, Starfield) take no props or minimal config props
- Always use TypeScript inline types for props, not separate interface declarations

---

## Common Mistakes

- **Importing from wrong path** — always use `@/lib/` alias, never relative `../../lib/`
- **Reading full store** — `useStore()` with no selector causes re-renders on every mutation
- **Adding local state for persisted data** — if it needs to survive refresh, it belongs in `AppState`
- **Duplicating panel logic** — shared domain logic belongs in `lib/store.ts` actions, not in component event handlers
