import type { EvidenceBundle, ExportManifest, ReplayResult } from "../../domain/types/audit.js";
import { ExecutionGateService } from "../execution/execution-gate-service.js";

function nowIso(): string {
  return new Date().toISOString();
}

export class ReplayService {
  constructor(private readonly executionGateService: ExecutionGateService) {}

  replay(bundle: EvidenceBundle): ReplayResult {
    const replayed = this.executionGateService.evaluate(bundle.request);

    const matchedOriginalOutcome =
      replayed.decisionEnvelope.finalState === bundle.decisionEnvelope.finalState &&
      replayed.decisionEnvelope.permittedActionClass === bundle.decisionEnvelope.permittedActionClass &&
      JSON.stringify(replayed.decisionEnvelope.trace.reasonCodes) ===
        JSON.stringify(bundle.decisionEnvelope.trace.reasonCodes);

    return {
      originalRequestId: bundle.request.requestId,
      originalEnvelopeId: bundle.decisionEnvelope.envelopeId,
      replayedFinalState: replayed.decisionEnvelope.finalState,
      replayedPermittedActionClass: replayed.decisionEnvelope.permittedActionClass,
      matchedOriginalOutcome,
      replayedAt: nowIso()
    };
  }

  exportReferencesOriginalEvidence(
    bundle: EvidenceBundle,
    manifest: ExportManifest
  ): boolean {
    return (
      manifest.evidenceBundleId === bundle.evidenceBundleId &&
      manifest.envelopeId === bundle.decisionEnvelope.envelopeId &&
      manifest.sourceEvidenceImmutable === true &&
      manifest.sourceEventHashes.length === bundle.eventChain.length
    );
  }
}
