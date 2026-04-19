import { describe, expect, it } from "vitest";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";
import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../src/services/evidence/evidence-bundle-service.js";
import { ExportManifestService } from "../src/services/export/export-manifest-service.js";
import { ReplayService } from "../src/services/replay/replay-service.js";
import { DiagnosticReportService } from "../src/services/diagnostics/diagnostic-report-service.js";
import { REASON_CODES } from "../src/domain/constants/reason-codes.js";

describe("DiagnosticReportService", () => {
  it("produces a support-ready report for an allowed request", () => {
    const request = buildValidGovernedRequest();
    const gate = new ExecutionGateService();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const exportService = new ExportManifestService(log);
    const replayService = new ReplayService(gate);
    const diagnosticService = new DiagnosticReportService();

    const gateResult = gate.evaluate(request);
    const evidenceBundle = evidenceService.createBundle({ request, gateResult });
    const exportManifest = exportService.createAuthorityPackageManifest(evidenceBundle);
    const replayResult = replayService.replay(evidenceBundle);

    const report = diagnosticService.createReport({
      request,
      gateResult,
      evidenceBundle,
      replayResult,
      exportManifest,
      chainVerified: log.verifyChain()
    });

    expect(report.summary.finalState).toBe("ALLOW");
    expect(report.summary.releaseAuthorizationIssued).toBe(true);
    expect(report.summary.severity).toBe("INFO");
    expect(report.summary.replayMatchedOriginalOutcome).toBe(true);
    expect(report.auditSummary.chainVerified).toBe(true);
    expect(report.recommendedNextAction.action).toBe("No support action required.");
  });

  it("produces a clear operator explanation and recommended action for missing approval", () => {
    const request = buildValidGovernedRequest();
    request.approvalArtifact = null;

    const gate = new ExecutionGateService();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const replayService = new ReplayService(gate);
    const diagnosticService = new DiagnosticReportService();

    const gateResult = gate.evaluate(request);
    const evidenceBundle = evidenceService.createBundle({ request, gateResult });
    const replayResult = replayService.replay(evidenceBundle);

    const report = diagnosticService.createReport({
      request,
      gateResult,
      evidenceBundle,
      replayResult,
      chainVerified: log.verifyChain()
    });

    expect(report.summary.finalState).toBe("HOLD");
    expect(report.summary.primaryReason).toBe(REASON_CODES.REQUIRED_APPROVAL_MISSING);
    expect(report.operatorExplanation).toContain("held because approval was required");
    expect(report.recommendedNextAction.action).toContain("Provide a valid approvalArtifact");
    expect(report.summary.severity).toBe("WARNING");
  });

  it("marks replay mismatch as critical", () => {
    const request = buildValidGovernedRequest();
    const gate = new ExecutionGateService();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const diagnosticService = new DiagnosticReportService();

    const gateResult = gate.evaluate(request);
    const evidenceBundle = evidenceService.createBundle({ request, gateResult });

    const report = diagnosticService.createReport({
      request,
      gateResult,
      evidenceBundle,
      replayResult: {
        originalRequestId: request.requestId,
        originalEnvelopeId: gateResult.decisionEnvelope.envelopeId,
        replayedFinalState: "REJECT",
        replayedPermittedActionClass: null,
        matchedOriginalOutcome: false,
        replayedAt: new Date().toISOString()
      },
      chainVerified: true
    });

    expect(report.summary.severity).toBe("CRITICAL");
    expect(report.summary.replayMatchedOriginalOutcome).toBe(false);
  });

  it("produces invariant matrix entries with pass/fail statuses", () => {
    const request = buildValidGovernedRequest();
    request.provenanceRef = null;

    const gate = new ExecutionGateService();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const replayService = new ReplayService(gate);
    const diagnosticService = new DiagnosticReportService();

    const gateResult = gate.evaluate(request);
    const evidenceBundle = evidenceService.createBundle({ request, gateResult });
    const replayResult = replayService.replay(evidenceBundle);

    const report = diagnosticService.createReport({
      request,
      gateResult,
      evidenceBundle,
      replayResult,
      chainVerified: log.verifyChain()
    });

    const provenanceInvariant = report.invariantChecks.find(
      (entry) => entry.invariantId === "INV-02"
    );

    expect(provenanceInvariant?.status).toBe("FAIL");
    expect(provenanceInvariant?.explanation).toContain("provenanceRef is null");
  });

  it("escalates immediately when replay mismatch is detected on an allowed request", () => {
    const request = buildValidGovernedRequest();
    const gate = new ExecutionGateService();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const diagnosticService = new DiagnosticReportService();

    const gateResult = gate.evaluate(request);
    const evidenceBundle = evidenceService.createBundle({ request, gateResult });

    const report = diagnosticService.createReport({
      request,
      gateResult,
      evidenceBundle,
      replayResult: {
        originalRequestId: request.requestId,
        originalEnvelopeId: gateResult.decisionEnvelope.envelopeId,
        replayedFinalState: "REJECT",
        replayedPermittedActionClass: null,
        matchedOriginalOutcome: false,
        replayedAt: new Date().toISOString()
      },
      chainVerified: true
    });

    expect(report.summary.severity).toBe("CRITICAL");
    expect(report.summary.replayMatchedOriginalOutcome).toBe(false);
    expect(report.recommendedNextAction.action).toContain("Escalate immediately");
  });
});
