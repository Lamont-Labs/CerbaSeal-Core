# CerbaSeal — Pilot Readiness Brief

## First Pilot Shape

The recommended first pilot shape is:

> One client, one workflow, one decision path, one approval model, one enforcement promise, one verifiable outcome.

Constrained scope reduces support burden, prevents scope creep, and makes pilot success criteria unambiguous.

## Required Client Inputs

Before a pilot can begin, the following must be defined in collaboration with the client:

**Workflow:**
- workflow name and description
- decision point in the client system
- upstream proposal source (what generates the action proposal)
- downstream action system (what executes on ALLOW)

**Action model:**
- permitted action classes
- whether approval is required (and for which workflows)
- prohibited-use conditions
- sensitive data flag scope

**Provenance and policy:**
- policy pack version
- provenance fields: model version, rule set version, source hash
- control validity requirements
- trust state source

**Approval model:**
- required human authority classes
- who approves HOLD outcomes
- who receives diagnostic reports

**Evidence and logging:**
- logging destination
- evidence retention period
- evidence ownership

**Deployment:**
- deployment environment (see deployment brief)
- who owns deployment
- who owns support

**Success:**
- pilot success criteria (see below)
- who signs off on success

## Pilot Scope Boundaries

In scope:
- one defined workflow
- fixed action classes
- enforcement evaluation
- evidence generation
- operator action guidance from reason codes
- bug fixes within defined scope
- scenario clarification
- configuration adjustment
- deployment assistance

Out of scope:
- new workflow classes
- new feature development
- new integration layers
- multi-client support
- production monitoring
- indefinite support
- open-ended custom development
- legal or compliance certification

Changes outside scope become a next phase — defined in a separate agreement.

## Support Boundary

Support during pilot covers:

- bug fix: reproducible enforcement behavior that contradicts the specification
- scenario clarification: explaining what a reason code or diagnostic output means
- configuration adjustment: adjusting fixed parameters within the defined workflow scope
- deployment assistance: helping configure the enforcement layer in the agreed environment

Support during pilot does not cover:

- new workflow classes
- new feature development
- new external integration
- indefinite on-call support

## Proposed Pilot Success Criteria

These are proposed, non-binding sample criteria. Actual criteria are agreed with the client.

- CerbaSeal processes defined workflow inputs deterministically
- All scenario outputs are stable across repeated runs
- AI cannot produce authority-bearing action in any test case
- Required approval paths HOLD until approval is present
- Approved action produces release authorization
- Evidence bundle is created for every evaluation
- Replay matches original outcome
- Audit chain verifies
- Client can understand diagnostic output without founder involvement

## Agreement Prerequisites

Before pilot execution, the following require a signed working agreement:

- commercial terms
- ownership of evidence records
- liability boundary
- support period and scope
- payment and billing
- data processing agreement (if applicable)
- version freeze and update process

This brief does not include pricing, revenue terms, or commercial commitments.
Those require a separate working agreement.

## Current Limitation Notice

This is a review-ready core demo, not a production client deployment.
No pilot client currently exists. All pilot shapes described here are proposed, not contracted.

---

## Client Adoption Materials

A complete Client Adoption Pack is available to support Line Axia and pilot clients through qualification, onboarding, and self-service operation:

- [Client Readiness Assessment](../client-adoption/client-readiness-assessment.md) — scoring rubric for pilot qualification
- [Workflow Mapping Workbook](../client-adoption/workflow-mapping-workbook.md) — facilitated session guide and CerbaSeal field map
- [Pilot Success Framework](../client-adoption/pilot-success-framework.md) — success criteria for client, Lamont Labs, and Line Axia
- [Quickstart Deployment Guide](../client-adoption/quickstart-deployment-guide.md) — step-by-step deployment with three time-boxed paths
- [Troubleshooting Guide](../client-adoption/troubleshooting-guide.md) — symptom-indexed issue resolution
- [Client Admin Guide](../client-adoption/client-admin-guide.md) — client admin role, audit file ownership, escalation path
- [Training Kit](../client-adoption/training/) — role-specific guides for admins, operators, reviewers, and executives
- [Governance Templates](../client-adoption/templates/) — four pre-built workflow templates with ALLOW/HOLD/REJECT examples
- [Line Axia Partner Enablement Pack](../client-adoption/line-axia-partner-enablement-pack.md) — qualification and objection handling without Jesse
- [EU AI Act / NIS2 Mapping](../client-adoption/eu-ai-act-nis2-mapping-support.md) — regulatory relevance framing
- [Pilot Sizing and Pricing Framework](../client-adoption/pilot-sizing-and-pricing-framework.md) — three pilot tiers with scope and pricing factors
