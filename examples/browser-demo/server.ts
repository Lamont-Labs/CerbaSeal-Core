import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";
import type { GateResult } from "../../src/domain/types/core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = "0.0.0.0";

function buildResponse(result: GateResult) {
  return {
    finalState: result.decisionEnvelope.finalState,
    reasonCodes: result.decisionEnvelope.trace.reasonCodes,
    releaseAuthorizationExists: result.releaseAuthorization !== null,
    blockedActionRecordExists: result.blockedActionRecord !== null,
    releaseAuthorization: result.releaseAuthorization,
    blockedActionRecord: result.blockedActionRecord,
    fullResult: result
  };
}

function serveFile(res: ReturnType<typeof createServer> extends any ? any : never, filePath: string, contentType: string) {
  try {
    const content = readFileSync(filePath, "utf-8");
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to read static file" }));
  }
}

function serveScenario(res: any, scenarioFn: () => GateResult) {
  try {
    const result = scenarioFn();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildResponse(result), null, 2));
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

  if (url === "/api/reject") {
    serveScenario(res, getRejectScenario);
    return;
  }

  if (url === "/api/hold") {
    serveScenario(res, getHoldScenario);
    return;
  }

  if (url === "/api/allow") {
    serveScenario(res, getAllowScenario);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found", path: url }));
});

server.on("error", (err) => {
  console.error("Server error:", err.message);
});

server.listen(PORT, HOST, () => {
  console.log(`CerbaSeal browser demo running at http://localhost:${PORT}`);
  console.log("Routes: GET /api/reject  /api/hold  /api/allow");
});
