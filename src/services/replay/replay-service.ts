/**
 * CerbaSeal Replay Core
 *
 * Re-evaluates a governed request from a stored evidence bundle and
 * verifies that the outcome matches the original governed decision.
 * Deterministic evaluation ensures replay consistency over time.
 */

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
    // Fix 5: Compare actual hash values, not just array length.
    // The previous implementation returned true for a manifest with the correct
    // event count but completely different hash content, making the verification
    // meaningless. Each hash in the manifest must match the corresponding entry
    // in the bundle's event chain at the same index.
    if (manifest.sourceEventHashes.length !== bundle.eventChain.length) {
      return false;
    }

    const hashesMatch = manifest.sourceEventHashes.every(
      (hash, index) => hash === bundle.eventChain[index]?.entryHash
    );

    return (
      manifest.evidenceBundleId === bundle.evidenceBundleId &&
      manifest.envelopeId === bundle.decisionEnvelope.envelopeId &&
      manifest.sourceEvidenceImmutable === true &&
      hashesMatch
    );
  }
}
