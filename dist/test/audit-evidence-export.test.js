import { describe, expect, it } from "vitest";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";
import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../src/services/evidence/evidence-bundle-service.js";
import { ExportManifestService } from "../src/services/export/export-manifest-service.js";
import { ReplayService } from "../src/services/replay/replay-service.js";
describe("Drop 02 audit + evidence + export + replay", () => {
    it("creates an append-only chain for an allowed request", () => {
        const request = buildValidGovernedRequest();
        const gate = new ExecutionGateService();
        const log = new AppendOnlyLogService();
        const evidenceService = new EvidenceBundleService(log);
        const gateResult = gate.evaluate(request);
        const bundle = evidenceService.createBundle({ request, gateResult });
        expect(bundle.decisionEnvelope.finalState).toBe("ALLOW");
        expect(bundle.releaseAuthorization).not.toBeNull();
        expect(bundle.blockedActionRecord).toBeNull();
        expect(bundle.eventChain.length).toBeGreaterThanOrEqual(3);
        expect(log.verifyChain()).toBe(true);
        for (let index = 1; index < bundle.eventChain.length; index += 1) {
            expect(bundle.eventChain[index]?.previousHash).toBe(bundle.eventChain[index - 1]?.entryHash);
        }
    });
    it("creates evidence for blocked requests too", () => {
        const request = buildValidGovernedRequest();
        request.approvalArtifact = null;
        const gate = new ExecutionGateService();
        const log = new AppendOnlyLogService();
        const evidenceService = new EvidenceBundleService(log);
        const gateResult = gate.evaluate(request);
        const bundle = evidenceService.createBundle({ request, gateResult });
        expect(bundle.decisionEnvelope.finalState).toBe("HOLD");
        expect(bundle.releaseAuthorization).toBeNull();
        expect(bundle.blockedActionRecord).not.toBeNull();
        expect(bundle.eventChain.some((entry) => entry.eventType === "ACTION_BLOCKED")).toBe(true);
        expect(log.verifyChain()).toBe(true);
    });
    it("returns immutable snapshots from the log service", () => {
        const request = buildValidGovernedRequest();
        const gate = new ExecutionGateService();
        const log = new AppendOnlyLogService();
        const evidenceService = new EvidenceBundleService(log);
        const gateResult = gate.evaluate(request);
        evidenceService.createBundle({ request, gateResult });
        const snapshotA = log.list();
        const originalFirstHash = snapshotA[0]?.entryHash ?? null;
        if (snapshotA[0]) {
            snapshotA[0].entryHash = "tampered";
        }
        const snapshotB = log.list();
        expect(snapshotB[0]?.entryHash).toBe(originalFirstHash);
        expect(log.verifyChain()).toBe(true);
    });
    it("creates an export manifest that references source evidence without mutating it", () => {
        const request = buildValidGovernedRequest();
        const gate = new ExecutionGateService();
        const log = new AppendOnlyLogService();
        const evidenceService = new EvidenceBundleService(log);
        const exportService = new ExportManifestService(log);
        const replayService = new ReplayService(gate);
        const gateResult = gate.evaluate(request);
        const bundle = evidenceService.createBundle({ request, gateResult });
        const originalEventHashes = bundle.eventChain.map((entry) => entry.entryHash);
        const manifest = exportService.createAuthorityPackageManifest(bundle);
        expect(manifest.evidenceBundleId).toBe(bundle.evidenceBundleId);
        expect(manifest.envelopeId).toBe(bundle.decisionEnvelope.envelopeId);
        expect(manifest.sourceEventHashes).toEqual(originalEventHashes);
        expect(replayService.exportReferencesOriginalEvidence(bundle, manifest)).toBe(true);
        expect(bundle.eventChain.map((entry) => entry.entryHash)).toEqual(originalEventHashes);
        expect(log.verifyChain()).toBe(true);
    });
    it("replays the same request to the same governed outcome", () => {
        const request = buildValidGovernedRequest();
        const gate = new ExecutionGateService();
        const log = new AppendOnlyLogService();
        const evidenceService = new EvidenceBundleService(log);
        const replayService = new ReplayService(gate);
        const gateResult = gate.evaluate(request);
        const bundle = evidenceService.createBundle({ request, gateResult });
        const replay = replayService.replay(bundle);
        expect(replay.originalRequestId).toBe(request.requestId);
        expect(replay.replayedFinalState).toBe("ALLOW");
        expect(replay.replayedPermittedActionClass).toBe("escalate");
        expect(replay.matchedOriginalOutcome).toBe(true);
    });
    it("replays a blocked request to the same blocked outcome", () => {
        const request = buildValidGovernedRequest();
        request.provenanceRef = null;
        const gate = new ExecutionGateService();
        const log = new AppendOnlyLogService();
        const evidenceService = new EvidenceBundleService(log);
        const replayService = new ReplayService(gate);
        const gateResult = gate.evaluate(request);
        const bundle = evidenceService.createBundle({ request, gateResult });
        const replay = replayService.replay(bundle);
        expect(bundle.decisionEnvelope.finalState).toBe("REJECT");
        expect(replay.replayedFinalState).toBe("REJECT");
        expect(replay.matchedOriginalOutcome).toBe(true);
    });
});
