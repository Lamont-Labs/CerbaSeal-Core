import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";
import type { GateResult } from "../../src/domain/types/core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

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

const server = createServer((req, res) => {
  const url = req.url ?? "/";

  if (url === "/" || url === "/index.html") {
    const html = readFileSync(join(__dirname, "index.html"), "utf-8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (url === "/client.js") {
    const js = readFileSync(join(__dirname, "client.js"), "utf-8");
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    res.end(js);
    return;
  }

  if (url === "/api/reject") {
    const result = getRejectScenario();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildResponse(result), null, 2));
    return;
  }

  if (url === "/api/hold") {
    const result = getHoldScenario();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildResponse(result), null, 2));
    return;
  }

  if (url === "/api/allow") {
    const result = getAllowScenario();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildResponse(result), null, 2));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`CerbaSeal browser demo running at http://localhost:${PORT}`);
});
