function nowIso() {
    return new Date().toISOString();
}
function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}
export class EvidenceBundleService {
    logService;
    constructor(logService) {
        this.logService = logService;
    }
    createBundle(args) {
        const { request, gateResult } = args;
        this.logService.append({
            requestId: request.requestId,
            eventType: "REQUEST_EVALUATED",
            payload: {
                requestId: request.requestId,
                finalState: gateResult.decisionEnvelope.finalState,
                envelopeId: gateResult.decisionEnvelope.envelopeId
            }
        });
        if (gateResult.releaseAuthorization !== null) {
            this.logService.append({
                requestId: request.requestId,
                eventType: "RELEASE_AUTHORIZED",
                payload: {
                    requestId: request.requestId,
                    releaseAuthorizationId: gateResult.releaseAuthorization.releaseAuthorizationId,
                    actionClass: gateResult.releaseAuthorization.actionClass
                }
            });
        }
        if (gateResult.blockedActionRecord !== null) {
            this.logService.append({
                requestId: request.requestId,
                eventType: "ACTION_BLOCKED",
                payload: {
                    requestId: request.requestId,
                    finalState: gateResult.blockedActionRecord.finalState,
                    reasonCodes: gateResult.blockedActionRecord.reasonCodes
                }
            });
        }
        this.logService.append({
            requestId: request.requestId,
            eventType: "EVIDENCE_BUNDLE_CREATED",
            payload: {
                requestId: request.requestId,
                evidenceBundleId: gateResult.decisionEnvelope.evidenceBundleId
            }
        });
        const bundle = {
            evidenceBundleId: gateResult.decisionEnvelope.evidenceBundleId,
            request: deepClone(request),
            decisionEnvelope: deepClone(gateResult.decisionEnvelope),
            releaseAuthorization: deepClone(gateResult.releaseAuthorization),
            blockedActionRecord: deepClone(gateResult.blockedActionRecord),
            eventChain: this.logService.listByRequestId(request.requestId),
            createdAt: nowIso()
        };
        return deepClone(bundle);
    }
}
