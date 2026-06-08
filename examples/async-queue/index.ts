/**
 * CerbaSeal Async Queue
 *
 * Pattern: CerbaSeal in an async workflow with in-memory job queue.
 * An AI worker proposes an action → gate holds it for human review →
 * reviewer approves → job is released and executed.
 *
 * Use when:
 *   - AI agents propose actions that require human approval before execution
 *   - You need to decouple the proposal step from the execution step
 *   - You want to model async review loops without a real queue library
 *
 * This kit uses NO external queue library. All state is in-memory to keep
 * the pattern clear. Replace the JobQueue internals with your queue system
 * (Bull, BullMQ, SQS, etc.) while keeping the same gate integration boundary.
 *
 * To run: pnpm tsx examples/async-queue/index.ts
 * To validate: pnpm tsx examples/async-queue/validate-async-queue.ts
 */

import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest, ApprovalArtifact, HumanAuthorityClass } from "../../src/domain/types/core.js";
import type { EvidenceBundle } from "../../src/domain/types/audit.js";

export type JobStatus = "PENDING" | "HELD" | "ALLOWED" | "REJECTED";

export interface Job {
  jobId: string;
  request: GovernedRequest;
  status: JobStatus;
  enqueuedAt: string;
  evidenceBundle?: EvidenceBundle;
  releasedAt?: string;
  rejectedAt?: string;
}

export interface ReviewerInfo {
  reviewerId: string;
  approverAuthorityClass: HumanAuthorityClass;
  privilegedAuthSatisfied?: boolean;
}

export class JobQueue {
  private readonly jobs = new Map<string, Job>();
  private readonly gate: ExecutionGateService;
  private readonly logService: AppendOnlyLogService;
  private readonly evidenceService: EvidenceBundleService;

  constructor(gate: ExecutionGateService, logService: AppendOnlyLogService, evidenceService: EvidenceBundleService) {
    this.gate = gate;
    this.logService = logService;
    this.evidenceService = evidenceService;
  }

  /**
   * Enqueue a job. The gate is evaluated immediately.
   *   HOLD   → job stored in pending queue, returns status "HELD"
   *   ALLOW  → job released immediately, returns status "ALLOWED"
   *   REJECT → job blocked, returns status "REJECTED"
   */
  enqueue(request: GovernedRequest): Job {
    const enqueuedAt = new Date().toISOString();
    let gateResult;
    try {
      gateResult = this.gate.evaluate(request);
    } catch (err) {
      throw new Error(`Gate rejected request ${request.requestId}: ${err instanceof Error ? err.message : err}`);
    }

    const bundle = this.evidenceService.createBundle({ request, gateResult });
    const { finalState } = gateResult.decisionEnvelope;

    const job: Job = {
      jobId: request.requestId,
      request,
      status: finalState === "ALLOW" ? "ALLOWED" : finalState === "HOLD" ? "HELD" : "REJECTED",
      enqueuedAt,
      evidenceBundle: bundle
    };

    if (finalState === "ALLOW") {
      job.releasedAt = new Date().toISOString();
    } else if (finalState === "REJECT") {
      job.rejectedAt = new Date().toISOString();
    }

    this.jobs.set(job.jobId, job);
    return job;
  }

  /**
   * A human reviewer approves a held job.
   * Re-evaluates the original request with an approval artifact attached.
   *   ALLOW  → job released, status → "ALLOWED"
   *   REJECT → approval invalid, status → "REJECTED"
   *   HOLD   → should not happen after valid approval (treated as error)
   */
  approve(jobId: string, reviewer: ReviewerInfo): Job {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    if (job.status !== "HELD") throw new Error(`Job ${jobId} is not in HELD status (current: ${job.status})`);

    const approvalArtifact: ApprovalArtifact = {
      approvalId: `approval_${jobId}_${Date.now()}`,
      approverId: reviewer.reviewerId,
      forRequestId: jobId,
      approverAuthorityClass: reviewer.approverAuthorityClass,
      privilegedAuthSatisfied: reviewer.privilegedAuthSatisfied ?? true,
      immutableSignature: `sig_${reviewer.reviewerId}_${jobId}_${Date.now()}`,
      approvedAt: new Date().toISOString()
    };

    const approvedRequest: GovernedRequest = {
      ...job.request,
      approvalArtifact
    };

    let gateResult;
    try {
      gateResult = this.gate.evaluate(approvedRequest);
    } catch (err) {
      throw new Error(`Gate re-evaluation failed for job ${jobId}: ${err instanceof Error ? err.message : err}`);
    }

    const bundle = this.evidenceService.createBundle({ request: approvedRequest, gateResult });
    const { finalState } = gateResult.decisionEnvelope;

    if (finalState === "ALLOW") {
      job.status = "ALLOWED";
      job.releasedAt = new Date().toISOString();
      job.evidenceBundle = bundle;
      job.request = approvedRequest;
    } else if (finalState === "REJECT") {
      job.status = "REJECTED";
      job.rejectedAt = new Date().toISOString();
    } else {
      throw new Error(`Unexpected gate state after approval: ${finalState}`);
    }

    return job;
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  listByStatus(status: JobStatus): Job[] {
    return [...this.jobs.values()].filter(j => j.status === status);
  }

  get auditChainValid(): boolean {
    return this.logService.verifyChain();
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const config = loadCerbaSealConfig();
  const gate = new ExecutionGateService(config);
  const logService = new AppendOnlyLogService();
  const evidenceService = new EvidenceBundleService(logService);
  const queue = new JobQueue(gate, logService, evidenceService);

  const nowIso = () => new Date().toISOString();

  console.log("\nCERBASEAL ASYNC QUEUE — DEMO\n");
  console.log("Simulating: AI proposes escalation → gate holds → reviewer approves → released\n");

  const proposal: GovernedRequest = {
    requestId: "queue-job-001",
    workflowClass: "transaction_escalation",
    jurisdiction: "EU",
    actorId: "governance-system",
    actorAuthorityClass: "system",
    proposedActionClass: "escalate",
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: "escalate",
      confidence: 0.85,
      reasonCodes: ["velocity_anomaly", "high_value"],
      proposalCreatedAt: nowIso()
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: { id: "policy_txn_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "risk-v3", ruleSetVersion: "rules-2.1", sourceHash: "sha256:abc123" },
    approvalRequired: true,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-q-001" },
    trustState: { trusted: true, trustStateId: "ts-q-001" },
    createdAt: nowIso()
  };

  console.log("Step 1 — AI worker enqueues job");
  const job = queue.enqueue(proposal);
  console.log(`  → Job ID : ${job.jobId}`);
  console.log(`  → Status : ${job.status} (waiting for human approval)`);
  console.log(`  → Held jobs: ${queue.listByStatus("HELD").length}\n`);

  console.log("Step 2 — Human reviewer approves");
  const released = queue.approve(job.jobId, {
    reviewerId: "reviewer-alice-001",
    approverAuthorityClass: "reviewer",
    privilegedAuthSatisfied: true
  });
  console.log(`  → Status : ${released.status}`);
  console.log(`  → Released at: ${released.releasedAt}`);
  console.log(`  → Evidence bundle: ${released.evidenceBundle?.evidenceBundleId}`);
  console.log(`  → Approver: ${released.request.approvalArtifact?.approverId}\n`);

  console.log("Step 3 — Audit chain");
  console.log(`  → Audit entries: ${logService.list().length}`);
  console.log(`  → Chain valid  : ${queue.auditChainValid}`);

  console.log("\nDemo complete.\n");
}
