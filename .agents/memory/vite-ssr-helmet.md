---
name: Vite SSR + react-helmet-async v3
description: Why react-helmet-async context extraction is always empty in Vite SSR, and the workaround
---

## Rule
Do not rely on `helmetContext.helmet` for extracting server-rendered head tags in Vite SSR. Use a static route metadata lookup table instead.

## Why
react-helmet-async v3 detects the presence of DOM globals to decide whether it's running in a browser. Vite SSR provides DOM shims (including `window`, `document`), causing the library to believe it's in a browser and skip populating the server context. `helmetContext.helmet` will have zero keys even after `renderToString`.

## How to apply
Maintain a `ROUTE_META` table (title, description per route) in the prerender script. Use that table to inject `<title>`, `<meta name="description">`, canonical, og:*, and twitter:* tags into the built HTML. react-helmet-async still works correctly on the client side (dynamic updates after hydration).
