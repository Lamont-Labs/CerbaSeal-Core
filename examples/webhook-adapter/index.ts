/**
 * CerbaSeal Webhook Adapter
 *
 * Pattern: CerbaSeal as a webhook receiver.
 * An HTTP server accepts a workflow event (POST /event), runs it through the
 * gate, and POSTs the decision to a configurable CALLBACK_URL.
 *
 * Use when:
 *   - Your system emits events to webhook endpoints
 *   - CerbaSeal must sit between the event source and the downstream executor
 *   - You need async approval loops: HOLD pauses execution, approval resumes it
 *
 * Environment variables:
 *   CERBASEAL_WEBHOOK_PORT  — port to listen on (default: 4100)
 *   CERBASEAL_CALLBACK_URL  — URL to POST gate decisions to (required in production)
 *
 * To run: pnpm tsx examples/webhook-adapter/index.ts
 * To validate: pnpm tsx examples/webhook-adapter/validate-webhook-adapter.ts
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";

export const WEBHOOK_PORT = parseInt(process.env["CERBASEAL_WEBHOOK_PORT"] ?? "4100", 10);
export const CALLBACK_URL = process.env["CERBASEAL_CALLBACK_URL"] ?? "http://localhost:4101/callback";

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function jsonResponse(res: ServerResponse, statusCode: number, body: unknown): void {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(json);
}

async function postToCallback(payload: unknown): Promise<void> {
  try {
    await fetch(CALLBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error(`[webhook-adapter] Callback POST to ${CALLBACK_URL} failed:`, err instanceof Error ? err.message : err);
  }
}

export const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${WEBHOOK_PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    jsonResponse(res, 200, { status: "ok", service: "cerbaseal-webhook-adapter" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/event") {
    let body: string;
    try {
      body = await readBody(req);
    } catch {
      jsonResponse(res, 400, { error: "Failed to read request body" });
      return;
    }

    let request: GovernedRequest;
    try {
      request = JSON.parse(body) as GovernedRequest;
    } catch {
      jsonResponse(res, 400, { error: "Request body is not valid JSON" });
      return;
    }

    let gateResult;
    try {
      gateResult = gate.evaluate(request);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gate evaluation failed";
      jsonResponse(res, 422, { error: errMsg });
      return;
    }

    const bundle = evidenceService.createBundle({ request, gateResult });

    const callbackPayload = {
      requestId: request.requestId,
      workflowClass: request.workflowClass,
      finalState: gateResult.decisionEnvelope.finalState,
      envelopeId: gateResult.decisionEnvelope.envelopeId,
      evidenceBundleId: bundle.evidenceBundleId,
      humanApprovalRequired: gateResult.decisionEnvelope.humanApprovalRequired,
      releaseAuthorization: gateResult.releaseAuthorization ?? null,
      blockedActionRecord: gateResult.blockedActionRecord ?? null,
      callbackSentAt: new Date().toISOString()
    };

    jsonResponse(res, 202, {
      accepted: true,
      requestId: request.requestId,
      finalState: gateResult.decisionEnvelope.finalState,
      message:
        gateResult.decisionEnvelope.finalState === "HOLD"
          ? "Request is on hold pending human approval. Callback will be sent when resolved."
          : "Decision dispatched to callback URL."
    });

    await postToCallback(callbackPayload);
    return;
  }

  jsonResponse(res, 404, { error: "Not found" });
});

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  server.listen(WEBHOOK_PORT, () => {
    console.log("\nCerbaSeal Webhook Adapter");
    console.log(`  POST /event   — accept a workflow event, evaluate, callback with decision`);
    console.log(`  GET  /health  — health check`);
    console.log(`\n  Listening on port ${WEBHOOK_PORT}`);
    console.log(`  Callback URL : ${CALLBACK_URL}\n`);
  });
}
