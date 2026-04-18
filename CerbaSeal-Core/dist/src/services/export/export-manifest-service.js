function nowIso() {
    return new Date().toISOString();
}
function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}
export class ExportManifestService {
    logService;
    constructor(logService) {
        this.logService = logService;
    }
    createAuthorityPackageManifest(bundle) {
        const manifest = {
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
