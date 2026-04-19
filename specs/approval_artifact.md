# Approval Artifact Specification

## Purpose

Defines what constitutes a valid approval artifact in the CerbaSeal proof slice. This specification applies to the `approvalArtifact` field of a `GovernedRequest`.

---

## When an approval artifact is required

An approval artifact is required when `GovernedRequest.approvalRequired` is `true`.

When required, a missing or invalid artifact causes execution to be blocked. There is no grace path.

---

## Minimum required fields

| Field | Type | Required | Description |
|---|---|---|---|
| `approverAuthorityClass` | string (enum) | Yes | Role of the approving actor. Must be one of: `analyst`, `reviewer`, `manager`, `compliance_officer` |
| `privilegedAuthSatisfied` | boolean | Yes | Whether the approver completed elevated authentication. Must be `true` |
| `immutableSignature` | string | Yes | Non-empty signature or reference string binding the approval to this request. Empty string is invalid |

---

## Binding rules

**An approval must be bound to a specific request.**
Approvals are evaluated in the context of a specific `GovernedRequest` at evaluation time. There is no reuse mechanism in this proof slice. Each evaluation stands alone.

**A missing approval blocks execution.**
When `approvalRequired: true` and `approvalArtifact: null`, the outcome is `HOLD`. A `BlockedActionRecord` is issued. No `ReleaseAuthorization` is produced.

**An invalid approval blocks execution.**
When `approvalRequired: true` and an artifact is present but fails any of the checks below, the outcome is `REJECT`:

- `approverAuthorityClass` is not one of the four recognized values
- `privilegedAuthSatisfied` is `false`
- `immutableSignature` is empty or whitespace-only

**AI-generated or unsigned approval is invalid.**
There is no recognized `approverAuthorityClass` for AI actors. An AI-signed or AI-generated approval would not satisfy any recognized authority class and would result in rejection.

---

## Enforcement location

`src/services/execution/execution-gate-service.ts` → `assertApprovalState()`

---

## See also

`specs/approval_artifact.json` — example structure
`src/domain/types/core.ts` — `ApprovalArtifact` interface definition
