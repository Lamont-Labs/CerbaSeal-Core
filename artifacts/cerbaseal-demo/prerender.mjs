/**
 * Build-time prerender script.
 * Run after: vite build && vite build --ssr src/entry-server.tsx --outDir dist/server
 *
 * For each public route, renders the React tree to a string, replaces the
 * fallback meta tags with route-specific ones, injects the rendered HTML, and
 * writes a static index.html so search engines and AI crawlers receive real
 * content without executing JavaScript.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist/public");
const serverDir = path.resolve(__dirname, "dist/server");

const BASE_PATH = process.env.BASE_PATH ?? "/";
const base = BASE_PATH.endsWith("/") ? BASE_PATH.slice(0, -1) : BASE_PATH;

const CANONICAL_BASE =
  process.env.VITE_CANONICAL_BASE_URL?.replace(/\/$/, "") ??
  "https://cerbaseal.lamontlabs.io";

const OG_IMAGE = "/opengraph.jpg";
const SITE_NAME = "CerbaSeal";

const ROUTE_META = {
  "/": {
    title: `Client Success Center – ${SITE_NAME}`,
    description:
      "Everything you need to deploy, operate, and scale CerbaSeal. Readiness assessment, pilot generator, training center, troubleshooter, and partner enablement kit.",
  },
  "/assess": {
    title: `Readiness Assessment – ${SITE_NAME}`,
    description:
      "16 questions across 4 categories. Get an instant READY / READY WITH SUPPORT / NOT READY verdict, an onboarding hour estimate, and your recommended pilot tier. Takes ~8 minutes.",
  },
  "/pilot": {
    title: `Pilot Generator – ${SITE_NAME}`,
    description:
      "Generate a complete CerbaSeal pilot plan in 5 minutes. Enter your company, workflow, actors, approvals, and timeline. Get scope, success criteria, deployment checklist, and evidence requirements — ready to share.",
  },
  "/troubleshoot": {
    title: `Troubleshooter – ${SITE_NAME}`,
    description:
      "Guided diagnostic for CerbaSeal deployment and runtime issues. Walk through a decision tree to identify the probable cause and resolution path — before contacting support.",
  },
  "/training": {
    title: `Training Center – ${SITE_NAME}`,
    description:
      "Four CerbaSeal training tracks: Executive (10 min), Operator (30 min), Admin (30 min), Developer (self-paced). Clear objectives and structured topics for every role.",
  },
  "/partner": {
    title: `Partner Enablement Kit – ${SITE_NAME}`,
    description:
      "Everything a consulting partner needs to deliver CerbaSeal pilots independently. Four-level certification path, channel pricing structure, delivery kit, and resource library.",
  },
  "/wizard": {
    title: `Workflow Mapping Wizard – ${SITE_NAME}`,
    description:
      "Map your workflow to CerbaSeal in 6 guided steps. Define actions, AI role, human approvers, and deployment mode — then download a ready-to-deploy configuration package.",
  },
};

function escAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Inject route-specific head tags into the HTML template.
 * Replaces the fallback title, description, og and twitter tags in-place.
 * Robust against both fresh and previously-prerendered templates.
 */
function injectHeadTags(template, route) {
  const meta = ROUTE_META[route];
  if (!meta) return template;

  const canonicalUrl = `${CANONICAL_BASE}${route}`;
  const title = escAttr(meta.title);
  const desc = escAttr(meta.description);

  let html = template;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Replace <meta name="description" ...>
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${desc}" />`
  );

  // Replace or insert canonical
  if (/<link\s+rel="canonical"/.test(html)) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    );
  } else {
    // Insert canonical right after the description meta
    html = html.replace(
      /(<meta\s+name="description"[^>]*>)/,
      `$1\n    <link rel="canonical" href="${canonicalUrl}" />`
    );
  }

  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );

  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${desc}" />`
  );

  // Replace or insert og:url
  if (/<meta\s+property="og:url"/.test(html)) {
    html = html.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
  } else {
    html = html.replace(
      /(<meta\s+property="og:description"[^>]*>)/,
      `$1\n    <meta property="og:url" content="${canonicalUrl}" />`
    );
  }

  // Replace twitter:title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${desc}" />`
  );

  // Remove <!--app-head--> placeholder (no longer used for injection)
  html = html.replace(/\s*<!--app-head-->/, "");

  return html;
}

/**
 * Inject the SSR-rendered HTML into <div id="root">.
 * Handles both fresh empty root and previously-prerendered stale content.
 */
function injectBody(template, appHtml) {
  // Match <div id="root"> ... </div> (first occurrence, dotall)
  const rootPattern = /(<div id="root">)([\s\S]*?)(<\/div>)/;
  if (rootPattern.test(template)) {
    return template.replace(rootPattern, `$1${appHtml}$3`);
  }
  // Fallback: just remove the comment placeholder if present
  return template.replace("<!--app-html-->", appHtml);
}

async function main() {
  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("dist/public/index.html not found — run `vite build` first.");
    process.exit(1);
  }

  const serverEntryPath = path.join(serverDir, "entry-server.js");
  if (!fs.existsSync(serverEntryPath)) {
    console.error(
      "dist/server/entry-server.js not found — run `vite build --ssr src/entry-server.tsx --outDir dist/server` first."
    );
    process.exit(1);
  }

  // Save a pristine copy of the template before we start overwriting files
  const pristineTemplate = fs.readFileSync(templatePath, "utf-8");

  const { render } = await import(serverEntryPath);

  for (const route of Object.keys(ROUTE_META)) {
    console.log(`Prerendering: ${route}`);

    let appHtml = "";
    try {
      const result = render(route, base);
      appHtml = result.html ?? "";
    } catch (err) {
      console.warn(
        `  Warning: render failed for ${route}, writing shell only.`,
        err.message
      );
    }

    let html = injectHeadTags(pristineTemplate, route);
    html = injectBody(html, appHtml);

    const routeDir =
      route === "/"
        ? distDir
        : path.join(distDir, route.replace(/^\//, ""));

    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, "index.html"), html);
    console.log(`  → ${path.join(routeDir, "index.html")}`);
  }

  console.log("Prerender complete.");
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
