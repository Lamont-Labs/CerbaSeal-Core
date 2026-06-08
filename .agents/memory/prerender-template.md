---
name: Prerender template freshness
description: Pattern for keeping the prerender template pristine across multiple route writes
---

## Rule
Read the template file ONCE at the start of the prerender loop, store it in memory, and write all route files from that in-memory copy. Never re-read the template after writing any route file.

## Why
The prerender script writes `dist/public/index.html` for the root route (`/`). If the script re-reads the template on each iteration, the second and later routes get a template that already contains the home-page prerendered content — producing stale HTML in all non-root routes.

## How to apply
```js
const pristineTemplate = fs.readFileSync(templatePath, "utf-8");
for (const route of routes) {
  let html = injectHeadTags(pristineTemplate, route); // use pristine copy
  html = injectBody(html, appHtml);
  fs.writeFileSync(outputPath, html);
}
```

## Additional note
Vite 7 preserves HTML comments in production builds by default (no HTML minification). If comments were stripped during a debugging session, the likely cause is a stale `dist/public/index.html` from a previous prerender run, not Vite stripping them.
