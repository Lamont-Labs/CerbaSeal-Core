# CerbaSeal — Founder Independence Kit

**Purpose:** Everything a new client, partner, or technical team needs to deploy, configure, and operate CerbaSeal without requiring Jesse Lamont.

**Who this is for:** Line Axia technical and sales staff, client technical leads, pilot operators.

**Target outcome:** A new client can complete their pilot deployment, generate evidence, and operate CerbaSeal day-to-day without a call to Lamont Labs.

---

## The Independence Stack

This kit is organized in the order a new client encounters CerbaSeal.

---

### Stage 1 — Understanding (Before Any Technical Work)

Read these before anything else.

| Document | Time | Purpose |
|---|---|---|
| [10-Minute Executive Overview](client-adoption/training/10-minute-executive-overview.md) | 10 min | What CerbaSeal is and why it exists |
| [One-Page Summary](one-page.md) | 2 min | Single-page reference |
| [Governance Vocabulary](governance-vocabulary.md) | 5 min | Shared language for all discussions |
| [System Definition](01-system-definition.md) | 10 min | Scope, boundaries, what the system does |
| [Non-Goals](05-non-goals.md) | 5 min | What CerbaSeal is explicitly not |

---

### Stage 2 — Client Qualification

Before committing to a pilot, confirm the client is ready.

| Document | Time | Purpose |
|---|---|---|
| [Client Readiness Assessment](client-adoption/client-readiness-assessment.md) | 20 min | Checklist to confirm pilot feasibility |
| [Client Qualification Scorecard](client-adoption/client-qualification-scorecard.md) | 15 min | Score the client 0–100 for pilot readiness |
| [Pilot Sizing and Pricing Framework](client-adoption/pilot-sizing-and-pricing-framework.md) | 15 min | Determine tier and budget range |
| [Client Discovery Script](client-adoption/client-discovery-script.md) | 20 min | Discovery call script for Line Axia reps |

---

### Stage 3 — Workflow Mapping

Map the client's workflow to CerbaSeal before any deployment work begins.

| Document | Time | Purpose |
|---|---|---|
| [Workflow Mapping Workbook](client-adoption/workflow-mapping-workbook.md) | 45 min | Facilitated session workbook |
| [Self-Service Configuration Wizard Spec](client-adoption/self-service-configuration-wizard-spec.md) | 30 min | Future: generate config package without facilitation |
| [Workflow Config Generator](../scripts/generate-pilot-config.ts) | CLI | `pnpm generate:pilot-config` — generate config package from wizard input |
| [Wizard Input Template](../scripts/wizard-input.example.json) | — | Copy, fill in, run the generator |
| [Workflow Templates](client-adoption/templates/) | — | Pre-built templates for common workflow patterns |

---

### Stage 4 — Deployment

Deploy CerbaSeal to the client environment.

| Document | Time | Purpose |
|---|---|---|
| [Quickstart Deployment Guide](client-adoption/quickstart-deployment-guide.md) | 45 min | Step-by-step deployment for Mode C |
| [Deployment Modes](../docs/deployment/deployment-modes.md) | 10 min | Mode A / B / C — choose the right mode |
| [Mode C: Client-Controlled](../docs/deployment/mode-c-client-controlled.md) | 30 min | Full client-controlled deployment guide |
| [Pilot Deployment Checklist](../docs/deployment/pilot-deployment-checklist.md) | — | Pre-flight checklist before going live |
| [Runbook](../docs/deployment/runbook.md) | — | Operational runbook for day-to-day operations |
| [Authority Class Registry](cerbaseal.config.json) | — | `cerbaseal.config.json` — add custom authority classes without code changes |

**To add custom authority classes (e.g., `risk_officer`, `supervisor`, `director`):**
```json
// cerbaseal.config.json
{
  "authorityClasses": {
    "core": ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"],
    "extended": ["risk_officer", "supervisor", "director"]
  }
}
```
Then pass the config when constructing the gate:
```typescript
import { loadCerbaSealConfig } from "./src/config/cerbaseal-config.js";
import { ExecutionGateService } from "./src/services/execution/execution-gate-service.js";

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
```

---

### Stage 5 — Training

Train the client team before go-live.

| Document | Audience | Purpose |
|---|---|---|
| [30-Minute Onboarding Agenda](client-adoption/training/30-minute-onboarding-agenda.md) | All | Structured onboarding session |
| [Getting Started Guide](client-adoption/training/getting-started-guide.md) | Technical | Technical orientation |
| [Admin Guide](client-adoption/training/admin-guide.md) | Admins | Day-to-day administration |
| [Operator Guide](client-adoption/training/operator-guide.md) | Operators | Reviewing and approving decisions |
| [Reviewer Guide](client-adoption/training/reviewer-guide.md) | Reviewers | Using the review portal |
| [FAQ](client-adoption/training/faq.md) | All | Common questions |
| [Common Errors and Fixes](client-adoption/training/common-errors-and-fixes.md) | Technical | Troubleshooting reference |
| [Train-the-Trainer Program](client-adoption/train-the-trainer-program.md) | Line Axia | Enabling Line Axia to train clients |

---

### Stage 6 — Operations and Evidence

Operate CerbaSeal and generate evidence during the pilot.

| Document | Purpose |
|---|---|
| [Pilot Success Framework](client-adoption/pilot-success-framework.md) | Pilot success criteria and milestone tracking |
| [Pilot Delivery Playbook](client-adoption/pilot-delivery-playbook.md) | Week-by-week pilot management |
| [Pilot Operations Model](../docs/pilot-operations-model.md) | Support model: Tier 1 / Tier 2 / Tier 3 |
| [Support Boundaries](client-adoption/support-boundaries.md) | What Line Axia handles vs. what requires Lamont Labs |
| [Troubleshooting Guide](client-adoption/troubleshooting-guide.md) | Self-service issue resolution |

**Evidence generation commands:**
```bash
# Generate proof snapshot (test suite + audit checks + git provenance)
pnpm export:proof

# Generate human-readable governance report from proof snapshot
pnpm generate:evidence-report

# Verify proof snapshot integrity
pnpm verify:proof
```

**Evidence report outputs:**
- `governance-summary.md` — narrative summary of decisions and oversight
- `decision-summary.json` — structured decision data
- `audit-integrity-summary.md` — hash chain verification and audit log status

---

### Stage 7 — Security and Compliance

Reference materials for security reviews and compliance discussions.

| Document | Purpose |
|---|---|
| [Security Review Brief](security/security-review-brief.md) | CTO/security team review document |
| [Trust Boundary and Limitations](09-trust-boundary-and-limitations.md) | Honest statement of what CerbaSeal does and does not prove |
| [EU AI Act / NIS2 Mapping](client-adoption/eu-ai-act-nis2-mapping-support.md) | Regulatory alignment reference |
| [Artifact Signing Roadmap](security/artifact-signing-roadmap.md) | Planned cryptographic signing features |
| [Access Control and Rate Limiting](security/access-control-and-rate-limiting.md) | Network-layer security posture |

---

## Integration Starter Kits

Working code examples for the most common integration patterns. Copy and adapt.

| Starter Kit | When to Use |
|---|---|
| [REST API Starter](../examples/rest-api-starter/) | Client integrates via HTTP requests to a CerbaSeal endpoint |
| [Financial Approval Starter](../examples/financial-approval-starter/) | Manager approves analyst recommendations in financial workflows |
| [Fraud Workflow Starter](../examples/fraud-workflow-starter/) | AI-scored fraud triage with file-backed audit log |
| [Agent Integration Starter](../examples/agent-integration-starter/) | AI agent proposes, human approves before execution |

---

## Support Escalation Path

```
Client self-service → Line Axia Tier 2 → Lamont Labs Tier 3
```

| Tier | Handler | Response |
|---|---|---|
| Tier 1 | Client (self-service) | Immediate — use this kit |
| Tier 2 | Line Axia | Same/next business day |
| Tier 3 | Lamont Labs | 2–3 business days |

See [Support Boundaries](client-adoption/support-boundaries.md) for what each tier handles.

---

## Quick Reference — Key Commands

```bash
# Install dependencies
pnpm install

# Run all tests (415 tests, must all pass)
pnpm test

# Run repo audit (15 checks)
pnpm audit:repo

# Generate proof snapshot
pnpm export:proof

# Verify proof snapshot
pnpm verify:proof

# Generate pilot configuration package from wizard input
pnpm generate:pilot-config

# Generate governance evidence report
pnpm generate:evidence-report

# Run browser demo portal
pnpm demo:web
# Then open: http://localhost:3000
```

---

## What Requires Jesse (Lamont Labs Tier 3)

Be honest about this. These are not self-service:

1. **New core enforcement invariants** — adding a new hard rule to the gate requires TypeScript changes and new tests
2. **New proposal source kinds** beyond `ai` and `deterministic_rule`
3. **Cryptographic signing infrastructure** — HMAC signing is available but PKI-backed signing requires implementation work
4. **Third-party security review** — not yet completed; Jesse must coordinate
5. **Windows deployment** — not tested; support posture unclear

Everything else in this kit is self-service.

---

*CerbaSeal v0.1.0 — Lamont Labs / Jesse Lamont*
*Founder Independence Kit — generated 2026-06-05*
