import type {
  BlockedActionRecord,
  DecisionEnvelope,
  GovernedRequest,
  ReleaseAuthorization
} from "./core.js";

export type AuditEventType =
  | "REQUEST_EVALUATED"
  | "RELEASE_AUTHORIZED"
  | "ACTION_BLOCKED"
  | "EVIDENCE_BUNDLE_CREATED"
  | "EXPORT_MANIFEST_CREATED";

export interface AuditLogEntry {
  eventId: string;
  requestId: string;
  eventType: AuditEventType;
  timestamp: string;
  payloadHash: string;
  previousHash: string | null;
  entryHash: string;
}

export interface AuditEventPayload {
  requestId: string;
  eventType: AuditEventType;
  payload: Record<string, unknown>;
}

export interface EvidenceBundle {
  evidenceBundleId: string;
  request: GovernedRequest;
  decisionEnvelope: DecisionEnvelope;
  releaseAuthorization: ReleaseAuthorization | null;
  blockedActionRecord: BlockedActionRecord | null;
  eventChain: AuditLogEntry[];
  createdAt: string;
}

export interface ExportManifest {
  manifestId: string;
  evidenceBundleId: string;
  requestId: string;
  envelopeId: string;
  exportedAt: string;
  exportType: "authority_package";
  sourceEventHashes: string[];
  sourceEvidenceImmutable: true;
}

export interface ReplayResult {
  originalRequestId: string;
  originalEnvelopeId: string;
  replayedFinalState: "ALLOW" | "HOLD" | "REJECT";
  replayedPermittedActionClass: string | null;
  matchedOriginalOutcome: boolean;
  replayedAt: string;
}
