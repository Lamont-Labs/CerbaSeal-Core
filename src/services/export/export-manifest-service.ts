import type { EvidenceBundle, ExportManifest } from "../../domain/types/audit.js";
import { AppendOnlyLogService } from "../audit/append-only-log-service.js";

function nowIso(): string {
  return new Date().toISOString();
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class ExportManifestService {
  constructor(private readonly logService: AppendOnlyLogService) {}

  createAuthorityPackageManifest(bundle: EvidenceBundle): ExportManifest {
    const manifest: ExportManifest = {
      manifestId: `manifest_${bundle.evidenceBundleId}`,
      evidenceBundleId: bundle.evidenceBundleId,
      requestId: bundle.request.requestId,
      envelopeId: bundle.decisionEnvelope.envelopeId,
      exportedAt: nowIso(),
      exportType: "authority_package",
      sourceEventHashes: bundle.eventChain.map((entry) => entry.entryHash),
      sourceEvidenceImmutable: true
    };

    this.logService.append({
      requestId: bundle.request.requestId,
      eventType: "EXPORT_MANIFEST_CREATED",
      payload: {
        manifestId: manifest.manifestId,
        evidenceBundleId: manifest.evidenceBundleId,
        sourceEventHashes: manifest.sourceEventHashes
      }
    });

    return deepClone(manifest);
  }
}
