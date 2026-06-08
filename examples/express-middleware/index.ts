/**
 * CerbaSeal Express Middleware
 *
 * Pattern: CerbaSeal as drop-in Express middleware.
 * The cerbaSealGate() function returns an Express-compatible middleware that
 * gates any route. ALLOW → next(), REJECT → 403, HOLD → 202 with hold reference.
 *
 * Use when:
 *   - You have an existing Express.js application
 *   - You want to gate specific routes or route groups
 *   - You need the gate result available to downstream route handlers
 *
 * This file defines the middleware contract using inline Express-compatible
 * interfaces so it can be tested without Express installed. Drop the cerbaSealGate
 * function into any Express project — it follows the standard middleware signature.
 *
 * To run the demo: pnpm tsx examples/express-middleware/index.ts
 * To validate: pnpm tsx examples/express-middleware/validate-express-middleware.ts
 */

import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";
import type { EvidenceBundle } from "../../src/domain/types/audit.js";

export interface CerbaSealRequest {
  body: GovernedRequest;
  [key: string]: unknown;
}

export interface CerbaSealResponse {
  statusCode: number;
  locals: Record<string, unknown>;
  status(code: number): CerbaSealResponse;
  json(body: unknown): void;
}

export type NextFn = (err?: Error) => void;

export interface GateMiddlewareOptions {
  gate: ExecutionGateService;
  logService: AppendOnlyLogService;
  evidenceService: EvidenceBundleService;
  /**
   * Called when the gate returns HOLD. Default: respond with 202 and hold reference.
   * Override to queue the request for async review instead.
   */
  onHold?: (req: CerbaSealRequest, res: CerbaSealResponse, bundle: EvidenceBundle) => void;
}

/**
 * Returns an Express-compatible middleware that evaluates the request body
 * against the CerbaSeal execution gate before passing it downstream.
 *
 * Decision outcomes:
 *   ALLOW  → attaches gateResult + evidenceBundle to res.locals, calls next()
 *   REJECT → responds 403 with reason codes (does not call next())
 *   HOLD   → responds 202 with hold reference and envelopeId (does not call next())
 *
 * Usage in Express:
 *   app.post("/execute", cerbaSealGate(opts), yourHandler)
 *   router.use(cerbaSealGate(opts))  // gate entire router
 */
export function cerbaSealGate(opts: GateMiddlewareOptions) {
  return function middleware(req: CerbaSealRequest, res: CerbaSealResponse, next: NextFn): void {
    const request: GovernedRequest = req.body;

    let gateResult;
    try {
      gateResult = opts.gate.evaluate(request);
    } catch (err) {
      res.status(422).json({
        error: "Gate evaluation failed",
        detail: err instanceof Error ? err.message : "Unknown error"
      });
      return;
    }

    const bundle = opts.evidenceService.createBundle({ request, gateResult });
    const { finalState } = gateResult.decisionEnvelope;

    if (finalState === "ALLOW") {
      res.locals["gateResult"] = gateResult;
      res.locals["evidenceBundle"] = bundle;
      next();
      return;
    }

    if (finalState === "REJECT") {
      res.status(403).json({
        rejected: true,
        requestId: request.requestId,
        finalState: "REJECT",
        reasonCodes: gateResult.blockedActionRecord?.reasonCodes ?? [],
        envelopeId: gateResult.decisionEnvelope.envelopeId
      });
      return;
    }

    if (finalState === "HOLD") {
      if (opts.onHold) {
        opts.onHold(req, res, bundle);
        return;
      }
      res.status(202).json({
        held: true,
        requestId: request.requestId,
        finalState: "HOLD",
        envelopeId: gateResult.decisionEnvelope.envelopeId,
        evidenceBundleId: bundle.evidenceBundleId,
        message: "Request is on hold pending human approval."
      });
      return;
    }
  };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const config = loadCerbaSealConfig();
  const gate = new ExecutionGateService(config);
  const logService = new AppendOnlyLogService();
  const evidenceService = new EvidenceBundleService(logService);

  const opts: GateMiddlewareOptions = { gate, logService, evidenceService };
  const middleware = cerbaSealGate(opts);

  const nowIso = () => new Date().toISOString();

  function mockRes(): CerbaSealResponse {
    const r: CerbaSealResponse = {
      statusCode: 200,
      locals: {},
      status(code) { r.statusCode = code; return r; },
      json(body) { console.log(`  → Response ${r.statusCode}:`, JSON.stringify(body, null, 4)); }
    };
    return r;
  }

  console.log("\nCERBASEAL EXPRESS MIDDLEWARE — DEMO\n");

  console.log("Example 1 — REJECT: AI actor attempts self-authorization");
  const rejectBody: GovernedRequest = {
    requestId: "mw-reject-001", workflowClass: "fraud_triage", jurisdiction: "EU",
    actorId: "fraud-model-v2", actorAuthorityClass: "ai", proposedActionClass: "escalate",
    proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
      confidence: 0.92, reasonCodes: ["velocity_spike"], proposalCreatedAt: nowIso() },
    sensitive: true, prohibitedUse: false,
    policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "fraud-v2", ruleSetVersion: "rules-1.0", sourceHash: "sha256:abc" },
    approvalRequired: false, approvalArtifact: null, loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-001" },
    trustState: { trusted: true, trustStateId: "ts-001" }, createdAt: nowIso()
  };
  middleware({ body: rejectBody }, mockRes(), () => { console.log("  → next() called"); });

  console.log("\nExample 2 — HOLD: System actor, fraud_triage requires approval");
  const holdBody: GovernedRequest = {
    requestId: "mw-hold-001", workflowClass: "fraud_triage", jurisdiction: "EU",
    actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
    proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
      confidence: 0.88, reasonCodes: ["unusual_pattern"], proposalCreatedAt: nowIso() },
    sensitive: true, prohibitedUse: false,
    policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "fraud-v2", ruleSetVersion: "rules-1.0", sourceHash: "sha256:abc" },
    approvalRequired: false, approvalArtifact: null, loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-002" },
    trustState: { trusted: true, trustStateId: "ts-002" }, createdAt: nowIso()
  };
  middleware({ body: holdBody }, mockRes(), () => { console.log("  → next() called"); });

  console.log("\nExample 3 — ALLOW: System actor, non-approval workflow, all checks pass");
  const allowBody: GovernedRequest = {
    requestId: "mw-allow-001", workflowClass: "transaction_escalation", jurisdiction: "EU",
    actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
    proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
      confidence: 0.79, reasonCodes: ["risk_threshold_exceeded"], proposalCreatedAt: nowIso() },
    sensitive: true, prohibitedUse: false,
    policyPackRef: { id: "policy_txn_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "txn-v1", ruleSetVersion: "rules-2.0", sourceHash: "sha256:def" },
    approvalRequired: false, approvalArtifact: null, loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-003" },
    trustState: { trusted: true, trustStateId: "ts-003" }, createdAt: nowIso()
  };
  const allowRes = mockRes();
  middleware({ body: allowBody }, allowRes, () => {
    console.log(`  → next() called — gateResult in res.locals: ${allowRes.locals["gateResult"] !== undefined}`);
  });

  console.log("\nDemo complete.");
}
