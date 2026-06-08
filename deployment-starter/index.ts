/**
 * CerbaSeal — Deployment Starter (HTTP Server)
 *
 * Exposes the enforcement gate as an HTTP service.
 *
 *   POST /evaluate  — submit a GovernedRequest body, receive a GateResult
 *   GET  /health    — gate readiness and audit chain validity
 *
 * Configuration (env vars or defaults):
 *   PORT        — port to listen on (default: 3000)
 *   LOG_PATH    — audit log file path, or "memory" for in-process log (default: memory)
 *   CONFIG_PATH — path to cerbaseal.config.json (default: <cwd>/cerbaseal.config.json)
 *   POLICY_PATH — path to cerbaseal.policy.json (default: <cwd>/cerbaseal.policy.json)
 *
 * For Docker deployment, see docker-compose.yml and .env.template.
 * For direct Node.js deployment, see README.md.
 */

import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
import { FileBackedAppendOnlyLogService } from "cerbaseal-review/src/services/audit/file-backed-append-only-log-service.js";
import { AppendOnlyLogService } from "cerbaseal-review/src/services/audit/append-only-log-service.js";
import type { IAuditLogService } from "cerbaseal-review/src/services/audit/append-only-log-service.js";
import { loadCerbaSealConfig } from "cerbaseal-review/src/config/cerbaseal-config.js";
import { loadCerbaSealPolicy } from "cerbaseal-review/src/config/cerbaseal-policy.js";
import type { GovernedRequest } from "cerbaseal-review/src/domain/types/core.js";

const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
const LOG_PATH = process.env["LOG_PATH"] ?? "memory";
const CONFIG_PATH = process.env["CONFIG_PATH"] ?? join(process.cwd(), "cerbaseal.config.json");
const POLICY_PATH = process.env["POLICY_PATH"] ?? join(process.cwd(), "cerbaseal.policy.json");

const logService: IAuditLogService = LOG_PATH === "memory"
  ? new AppendOnlyLogService()
  : new FileBackedAppendOnlyLogService(LOG_PATH);

const config = loadCerbaSealConfig(CONFIG_PATH);
const policy = loadCerbaSealPolicy(POLICY_PATH);
const gate = new ExecutionGateService(config, policy);

const START_MS = Date.now();

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  if (method === "GET" && url === "/health") {
    const auditChainValid = logService.verifyChain();
    send(res, 200, {
      status: auditChainValid ? "ok" : "degraded",
      gateReady: true,
      auditChainValid,
      uptime: (Date.now() - START_MS) / 1000,
    });
    return;
  }

  if (method === "POST" && url === "/evaluate") {
    let body: string;
    try {
      body = await readBody(req);
    } catch {
      send(res, 400, { error: "Failed to read request body" });
      return;
    }

    let request: GovernedRequest;
    try {
      request = JSON.parse(body) as GovernedRequest;
    } catch {
      send(res, 400, { error: "Invalid JSON — expected a GovernedRequest object" });
      return;
    }

    try {
      const result = gate.evaluate(request);

      logService.append({
        requestId: request.requestId,
        eventType: "REQUEST_EVALUATED",
        payload: {
          finalState: result.decisionEnvelope.finalState,
          workflowClass: request.workflowClass,
          evidenceBundleId: result.decisionEnvelope.evidenceBundleId,
          actorId: request.actorId,
        },
      });

      send(res, 200, result);
    } catch (err) {
      send(res, 422, { error: err instanceof Error ? err.message : "Gate evaluation failed" });
    }
    return;
  }

  send(res, 404, {
    error: "Not found",
    routes: ["POST /evaluate", "GET /health"],
  });
});

server.listen(PORT, () => {
  console.log("CerbaSeal enforcement gate");
  console.log(`  http://localhost:${PORT}`);
  console.log(`  POST /evaluate  — submit a GovernedRequest, receive a GateResult`);
  console.log(`  GET  /health    — gate status and audit chain validity`);
  console.log(`  Audit log  : ${LOG_PATH === "memory" ? "in-memory (not persistent)" : LOG_PATH}`);
  console.log(`  Config     : ${CONFIG_PATH}`);
  console.log(`  Policy     : ${POLICY_PATH}`);
});
