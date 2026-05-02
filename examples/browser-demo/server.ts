import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";
import { buildDemoResponse } from "./response-builder.js";
import { REVIEW_SUMMARY, PILOT_READINESS, SECURITY_SUMMARY } from "./review-portal.js";
import type { ScenarioId } from "./response-builder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = "0.0.0.0";

function serveFile(res: any, filePath: string, contentType: string) {
  try {
    const content = readFileSync(filePath, "utf-8");
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to read static file" }));
  }
}

function serveScenario(res: any, scenarioId: ScenarioId, scenarioFn: () => ReturnType<typeof getRejectScenario>) {
  try {
    const gateResult = scenarioFn();
    const response   = buildDemoResponse(scenarioId, gateResult);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response, null, 2));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
}

function serveJson(res: any, data: unknown) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  res.setHeader("Cache-Control", "no-store");

  // Static files
  if (url === "/" || url === "/index.html") {
    serveFile(res, join(__dirname, "index.html"), "text/html; charset=utf-8");
    return;
  }
  if (url === "/client.js") {
    serveFile(res, join(__dirname, "client.js"), "application/javascript; charset=utf-8");
    return;
  }

  // Portal pages
  if (url === "/review") {
    serveFile(res, join(__dirname, "pages", "review.html"), "text/html; charset=utf-8");
    return;
  }
  if (url === "/pilot") {
    serveFile(res, join(__dirname, "pages", "pilot.html"), "text/html; charset=utf-8");
    return;
  }
  if (url === "/security") {
    serveFile(res, join(__dirname, "pages", "security.html"), "text/html; charset=utf-8");
    return;
  }
  if (url === "/deployment") {
    serveFile(res, join(__dirname, "pages", "deployment.html"), "text/html; charset=utf-8");
    return;
  }

  // Existing scenario routes
  if (url === "/api/reject") { serveScenario(res, "reject", getRejectScenario); return; }
  if (url === "/api/hold")   { serveScenario(res, "hold",   getHoldScenario);   return; }
  if (url === "/api/allow")  { serveScenario(res, "allow",  getAllowScenario);  return; }

  // New JSON portal endpoints
  if (url === "/api/review-summary") {
    serveJson(res, REVIEW_SUMMARY);
    return;
  }
  if (url === "/api/pilot-readiness") {
    serveJson(res, PILOT_READINESS);
    return;
  }
  if (url === "/api/security-summary") {
    serveJson(res, SECURITY_SUMMARY);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found", path: url }));
});

server.on("error", (err) => { console.error("Server error:", err.message); });

server.listen(PORT, HOST, () => {
  console.log(`CerbaSeal browser demo running at http://localhost:${PORT}`);
  console.log("Demo routes:   GET /api/reject  /api/hold  /api/allow");
  console.log("Portal pages:  GET /review  /pilot  /security  /deployment");
  console.log("JSON APIs:     GET /api/review-summary  /api/pilot-readiness  /api/security-summary");
});
