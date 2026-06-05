/**
 * CerbaSeal REST API Starter Kit
 *
 * Pattern: HTTP wrapper that exposes CerbaSeal gate evaluation as a REST endpoint.
 * Use when: Your existing system makes HTTP calls and you want a CerbaSeal sidecar.
 *
 * Key design decisions:
 * - The gate runs in-process (same Node.js server)
 * - Every request is evaluated before any action is taken
 * - Evidence bundles are created for every decision (ALLOW, HOLD, REJECT)
 * - The audit log is in-memory by default; swap to FileBackedAppendOnlyLogService for persistence
 *
 * To run: pnpm tsx examples/rest-api-starter/index.ts
 * To test: pnpm tsx examples/rest-api-starter/index.ts --validate
 */

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";
import type { EvidenceBundle } from "../../src/domain/types/audit.js";

const PORT = parseInt(process.env["PORT"] ?? "3100", 10);

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);

const decisionHistory: EvidenceBundle[] = [];

function readBody(req: Parameters<Parameters<typeof createServer>[0]>[0]): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function jsonResponse(
  res: Parameters<Parameters<typeof createServer>[0]>[1],
  statusCode: number,
  body: unknown
): void {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(json);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    jsonResponse(res, 200, { status: "ok", service: "cerbaseal-rest-api-starter" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/evaluate") {
    try {
      const body = await readBody(req);
      const request = JSON.parse(body) as GovernedRequest;

      const gateResult = gate.evaluate(request);
      const bundle = evidenceService.createBundle({ request, gateResult });
      decisionHistory.push(bundle);

      jsonResponse(res, 200, {
        requestId: request.requestId,
        finalState: gateResult.decisionEnvelope.finalState,
        permittedActionClass: gateResult.decisionEnvelope.permittedActionClass,
        envelopeId: gateResult.decisionEnvelope.envelopeId,
        evidenceBundleId: bundle.evidenceBundleId,
        humanApprovalRequired: gateResult.decisionEnvelope.humanApprovalRequired,
        releaseAuthorization: gateResult.releaseAuthorization,
        blockedActionRecord: gateResult.blockedActionRecord
      });
    } catch (err) {
      jsonResponse(res, 400, {
        error: err instanceof Error ? err.message : "Invalid request"
      });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/decisions") {
    jsonResponse(res, 200, {
      total: decisionHistory.length,
      chainValid: logService.verifyChain(),
      decisions: decisionHistory.map(b => ({
        evidenceBundleId: b.evidenceBundleId,
        requestId: b.request.requestId,
        finalState: b.decisionEnvelope.finalState,
        workflowClass: b.decisionEnvelope.workflowClass,
        createdAt: b.createdAt
      }))
    });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/decisions/")) {
    const requestId = url.pathname.replace("/decisions/", "");
    const bundle = decisionHistory.find(b => b.request.requestId === requestId);
    if (!bundle) {
      jsonResponse(res, 404, { error: "Decision not found" });
    } else {
      jsonResponse(res, 200, bundle);
    }
    return;
  }

  jsonResponse(res, 404, { error: "Not found" });
});

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const VALIDATE_MODE = process.argv.includes("--validate");

  if (VALIDATE_MODE) {
    server.listen(PORT, async () => {
      const base = `http://localhost:${PORT}`;
      let passed = 0;
      let failed = 0;

      async function check(label: string, fn: () => Promise<void>): Promise<void> {
        try {
          await fn();
          console.log(`  [PASS] ${label}`);
          passed++;
        } catch (e) {
          console.error(`  [FAIL] ${label}: ${e instanceof Error ? e.message : e}`);
          failed++;
        }
      }

      console.log("\nCerbaSeal REST API Starter — Validation\n");

      await check("GET /health returns ok", async () => {
        const r = await fetch(`${base}/health`);
        const b = await r.json() as Record<string, unknown>;
        if (b["status"] !== "ok") throw new Error("health check failed");
      });

      const sampleRequest: GovernedRequest = {
        requestId: "rest-reject-001",
        workflowClass: "fraud_triage",
        jurisdiction: "EU",
        actorId: "ai-model-001",
        actorAuthorityClass: "ai",
        proposedActionClass: "escalate",
        proposal: {
          proposalSourceKind: "ai",
          authorityBearing: false,
          requestedActionClass: "escalate",
          confidence: 0.91,
          reasonCodes: ["velocity_spike"],
          proposalCreatedAt: "2026-04-18T00:00:00.000Z"
        },
        sensitive: true,
        prohibitedUse: false,
        policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
        provenanceRef: { modelVersion: "model_1.2.3", ruleSetVersion: "rules_4.5.6", sourceHash: "sha256:abc" },
        approvalRequired: false,
        approvalArtifact: null,
        loggingReady: true,
        controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_001" },
        trustState: { trusted: true, trustStateId: "ts_001" },
        createdAt: "2026-04-18T00:00:00.000Z"
      };

      await check("POST /evaluate returns REJECT for AI self-authorization", async () => {
        const r = await fetch(`${base}/evaluate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sampleRequest)
        });
        const b = await r.json() as Record<string, unknown>;
        if (b["finalState"] !== "REJECT") throw new Error(`expected REJECT, got ${b["finalState"]}`);
      });

      await check("GET /decisions lists all decisions", async () => {
        const r = await fetch(`${base}/decisions`);
        const b = await r.json() as Record<string, unknown>;
        if ((b["total"] as number) < 1) throw new Error("no decisions recorded");
      });

      console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
      server.close();
      process.exit(failed > 0 ? 1 : 0);
    });
  } else {
    server.listen(PORT, () => {
      console.log(`\nCerbaSeal REST API Starter`);
      console.log(`  POST /evaluate    — evaluate a governed request`);
      console.log(`  GET  /decisions   — list all decisions`);
      console.log(`  GET  /decisions/:requestId — get specific decision bundle`);
      console.log(`  GET  /health      — health check`);
      console.log(`\n  Listening on port ${PORT}\n`);
    });
  }
}

export { server };
