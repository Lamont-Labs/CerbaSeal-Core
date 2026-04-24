# Auditor View

Transforms raw CerbaSeal GateResult output into a human-readable enforcement certificate.

## Concept

CerbaSeal produces structured GateResult objects for every evaluation. This module renders a plain-text certificate that a reviewer, operator, or auditor can read without inspecting raw JSON.

## Certificate Format

```
CERBASEAL CERTIFICATE OF ENFORCEMENT
────────────────────────────────────────────
Decision:         ALLOW
Request ID:       req_001
Workflow Class:   fraud_triage
Action Class:     escalate
Evidence Bundle:  <evidenceBundleId>
Evaluated At:     <timestamp>

Reason Codes:
  - DECISION_ALLOWED

Release Authorization: present
  Authorization ID: <releaseAuthorizationId>
  Action Class:     escalate
  Released At:      <timestamp>

Blocked Action Record: none

Evidence Status: recorded

Interpretation:
  The requested action was authorized for execution.

────────────────────────────────────────────
Note: This is a readable view of system output only.
It does not constitute legal or regulatory certification.
```

## Run

```sh
pnpm demo:audit
pnpm demo:audit:validate
```

## Files

- `render-certificate.ts` — certificate renderer (importable)
- `run-auditor-view.ts` — demo entry point (all three states)
- `validate-auditor-view.ts` — headless validation script

## Notes

- Uses real GateResult from ExecutionGateService.
- Does not claim legal or regulatory certification.
- Does not modify core enforcement logic.
- Does not claim production readiness.
