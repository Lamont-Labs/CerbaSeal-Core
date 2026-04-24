import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";
import { buildDemoResponse } from "./response-builder.js";
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

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  res.setHeader("Cache-Control", "no-store");

  if (url === "/" || url === "/index.html") {
    serveFile(res, join(__dirname, "index.html"), "text/html; charset=utf-8");
    return;
  }
  if (url === "/client.js") {
    serveFile(res, join(__dirname, "client.js"), "application/javascript; charset=utf-8");
    return;
  }
  if (url === "/api/reject") { serveScenario(res, "reject", getRejectScenario); return; }
  if (url === "/api/hold")   { serveScenario(res, "hold",   getHoldScenario);   return; }
  if (url === "/api/allow")  { serveScenario(res, "allow",  getAllowScenario);  return; }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found", path: url }));
});

server.on("error", (err) => { console.error("Server error:", err.message); });

server.listen(PORT, HOST, () => {
  console.log(`CerbaSeal browser demo running at http://localhost:${PORT}`);
  console.log("Routes: GET /api/reject  /api/hold  /api/allow");
});
