# CerbaSeal — REST API Starter Kit

## What This Is

An HTTP wrapper that exposes the CerbaSeal enforcement gate as REST endpoints.

**Use this when:** Your existing system makes HTTP calls and you want CerbaSeal to run as a sidecar service that all action requests must pass through before execution.

## Pattern

```
Your System  →  POST /evaluate  →  CerbaSeal Gate  →  ALLOW / HOLD / REJECT
                                         ↓
                                   Evidence Bundle
                                         ↓
                                    Audit Log
```

## Quick Start

```bash
# Run the API server
pnpm tsx examples/rest-api-starter/index.ts

# Validate it works
pnpm tsx examples/rest-api-starter/index.ts --validate

# Evaluate a governed request
curl -X POST http://localhost:3100/evaluate \
  -H "Content-Type: application/json" \
  -d @examples/rest-api-starter/sample-request.json

# List all decisions
curl http://localhost:3100/decisions

# Get specific decision bundle
curl http://localhost:3100/decisions/req_001

# Health check
curl http://localhost:3100/health
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/evaluate` | Evaluate a governed request. Returns final state + evidence bundle ID. |
| GET | `/decisions` | List all decisions in this session (in-memory). |
| GET | `/decisions/:requestId` | Get full evidence bundle for a specific request. |
| GET | `/health` | Service health check. |

## Configuration

**Add custom authority classes** (no TypeScript changes needed):

```json
// cerbaseal.config.json
{
  "authorityClasses": {
    "core": ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"],
    "extended": ["risk_officer", "supervisor", "director"]
  }
}
```

**Persist the audit log across restarts** (swap in FileBackedAppendOnlyLogService):

```typescript
import { FileBackedAppendOnlyLogService } from "../../src/services/audit/file-backed-append-only-log-service.js";

const logService = new FileBackedAppendOnlyLogService(
  process.env["CERBASEAL_AUDIT_LOG_PATH"] ?? "./audit.jsonl"
);
```

## Response Shape

**ALLOW:**
```json
{
  "requestId": "req_001",
  "finalState": "ALLOW",
  "permittedActionClass": "escalate",
  "envelopeId": "env_req_001",
  "evidenceBundleId": "evidence_req_001",
  "humanApprovalRequired": true,
  "releaseAuthorization": { ... },
  "blockedActionRecord": null
}
```

**HOLD:**
```json
{
  "requestId": "req_001",
  "finalState": "HOLD",
  "permittedActionClass": null,
  "envelopeId": "env_req_001",
  "evidenceBundleId": "evidence_req_001",
  "humanApprovalRequired": true,
  "releaseAuthorization": null,
  "blockedActionRecord": { "reasonCodes": ["REQUIRED_APPROVAL_MISSING", ...], ... }
}
```

**REJECT:**
```json
{
  "requestId": "req_001",
  "finalState": "REJECT",
  "permittedActionClass": null,
  "releaseAuthorization": null,
  "blockedActionRecord": { "reasonCodes": ["AI_CANNOT_AUTHORIZE", ...], ... }
}
```

## What to Implement in Your System

1. **Request builder:** Map your system's action requests to the `GovernedRequest` shape
2. **Approval bridge:** When your approver clicks "Approve", construct a valid `ApprovalArtifact` and resubmit the request with it
3. **HOLD handler:** When you receive `finalState: "HOLD"`, notify the approver and store the pending request
4. **ALLOW handler:** When you receive `finalState: "ALLOW"` with a `releaseAuthorization`, proceed with the action

## Trust Model

- Your system is responsible for constructing valid `GovernedRequest` objects
- CerbaSeal enforces: approval rules, AI authority limits, provenance requirements, control status
- CerbaSeal does **not** verify your approval is legitimate — it verifies the artifact shape and binding
- The audit log proves what decisions were made and when, but cannot prove your system honored them

See `docs/09-trust-boundary-and-limitations.md` for the full trust boundary statement.
