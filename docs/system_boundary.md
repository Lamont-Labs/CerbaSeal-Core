# System Boundary

## Purpose

This document states explicitly what CerbaSeal does and does not do in this proof repository. It is written for a technical or security reviewer evaluating the enforcement claim, not the full system.

---

## CerbaSeal does

- **Enforce a governed decision path.** Every evaluated request passes through a single gate with a defined invariant set. There is no unguarded path to a release authorization.

- **Validate structured requests.** The gate checks request shape, action classes, provenance, policy presence, trust state, control status, and logging readiness before any action is permitted.

- **Enforce approval requirements.** When a request carries `approvalRequired: true`, the gate checks that a valid, non-AI-generated, authority-bearing approval artifact is present before allowing release.

- **Gate execution.** A `ReleaseAuthorization` is issued only on a fully successful evaluation. Blocked outcomes produce no release. There is no partial release.

- **Emit decision evidence.** Every evaluation — whether allowed, held, or rejected — produces a `DecisionEnvelope`, an `EvidenceBundle`, and audit log entries. No outcome is silent.

- **Support replay consistency verification.** The system can re-evaluate a stored request and compare the outcome to the original decision, detecting inconsistencies.

- **Generate diagnostic reports.** The system can produce a structured, operator-readable explanation of what happened, why, and what the recommended next action is.

---

## CerbaSeal does not

- **Secure infrastructure.** This repository does not provision, harden, or monitor any infrastructure. Network security, host hardening, secrets management, and deployment topology are outside scope.

- **Replace identity providers.** CerbaSeal does not authenticate users, verify tokens, or manage sessions. The `trustState` and `approvalArtifact` fields in a governed request are asserted by the caller. CerbaSeal enforces their presence and structure — not their cryptographic origin.

- **Replace a full enterprise compliance program.** CerbaSeal enforces a governed decision path for a bounded set of consequential actions. It is not a compliance certification, a regulatory audit trail, or a substitute for legal or organizational governance.

- **Provide a complete production deployment package.** This repository is a proof slice. It does not include infrastructure code, deployment automation, environment configuration, or production-grade operational tooling.

- **Represent a finished multi-client product.** Client-specific workflow logic, policy packs, and deployment constraints are not included. They are the subject of paid pilot engagements.

- **Enforce downstream actions.** Once a `ReleaseAuthorization` is issued, CerbaSeal does not control what client systems do with it. Downstream enforcement is the responsibility of the system receiving the authorization.

- **Prevent runtime forgery by hostile internal callers.** All core types are plain interfaces. A malicious internal caller who has access to the type system can construct forged objects. Replay provides partial detection for invalid requests. For valid requests bypassed by a trusted-but-malicious caller, no detection mechanism exists in this proof slice. See `docs/09-trust-boundary-and-limitations.md`.

---

## Correct interpretation

This proof slice demonstrates that the enforcement core is real, deterministic, and inspectable. It does not demonstrate production deployment readiness. Those are separate and subsequent concerns.
