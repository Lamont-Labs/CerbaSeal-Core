import type { GateResult, GovernedRequest } from "../../domain/types/core.js";
import type { EvidenceBundle } from "../../domain/types/audit.js";
import { AppendOnlyLogService } from "../audit/append-only-log-service.js";

function nowIso(): string {
  return new Date().toISOString();
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class EvidenceBundleService {
  constructor(private readonly logService: AppendOnlyLogService) {}

  createBundle(args: {
    request: GovernedRequest;
    gateResult: GateResult;
  }): EvidenceBundle {
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

    const bundle: EvidenceBundle = {
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
