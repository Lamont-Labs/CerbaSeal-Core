---
name: Wouter v3 SSR routing
description: How to correctly render a specific route server-side with wouter v3 in Vite SSR
---

## Rule
Use `<Router ssrPath={routePath}>` — **not** `hook={() => [routePath, () => {}]}` — for server-side rendering with wouter v3.

## Why
Vite SSR provides `window.location` shims (pathname always `/`). When a custom `hook` prop is passed to Router, wouter internally still reads from `window.location` under Vite's DOM shims instead of the hook. The `ssrPath` prop bypasses this and forces the router to a static path.

## How to apply
```tsx
<Router base={staticBase} ssrPath={routePath}>
  {/* routes */}
</Router>
```
`routePath` should be the path relative to `base` (e.g. `/assess`, not `/base/assess`).
