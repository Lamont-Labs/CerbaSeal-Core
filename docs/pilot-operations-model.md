# CerbaSeal Pilot Operations Model

This document describes how a CerbaSeal pilot engagement operates. It is a process document, not a marketing document. Every commitment here is specific and bounded.

---

## Pilot Onboarding

### Week 1 — Scoping and Baseline

**Kickoff call (60 minutes)**
- Identify one workflow to govern during the pilot
- Define success criteria that both parties will evaluate at pilot completion
- Define authority boundaries: which actor classes are permitted, which require human approval
- Define required approval conditions for the target workflow
- Define escalation paths for governance failures

**Environment setup**
- Deploy CerbaSeal pilot environment against the identified workflow
- Execute baseline enforcement scenarios: REJECT, HOLD, ALLOW
- Confirm evidence bundle production and audit log output

**Week 1 deliverables:**
- Pilot scope document (signed by both parties)
- Workflow map: request flow, actor classes, approval chain
- Authority matrix: who may propose, who may approve, what is prohibited
- Baseline test scenarios with expected outcomes
- Success metrics: what "governance working" looks like for this workflow

---

## Issue Reporting

All issues enter a documented queue. Nothing is handled informally.

**Every issue receives:**
- Issue ID
- Severity level (1–4, defined below)
- Date reported
- Current status (Open / In Progress / Resolved / Deferred)
- Resolution notes

**Issue categories:**
- Bug — system behavior does not match documented enforcement
- Documentation — documentation is incorrect, missing, or misleading
- Feature request — behavior not currently in scope is requested
- Governance concern — a governance property is not operating as described
- Security concern — a potential vulnerability or trust model gap

**Process:**
Issues reported by email are logged to the issue queue on receipt. The queue is shared with the pilot participant at each weekly review. No issue is considered received unless it appears in the queue with an ID. Verbal-only issues do not exist.

---

## Support Commitment

**During pilot phase, support includes:**
- Email support for governance questions and issue investigation
- Scheduled weekly review calls (30 minutes)
- Weekly status update: open issues, resolved issues, enforcement metrics
- Pilot configuration assistance (scoping, workflow mapping, request construction)
- Evidence review: reading and explaining evidence bundles and audit chains
- Governance review: explaining enforcement decisions and invariant behavior
- Bug investigation: root-cause analysis for any behavior that deviates from documented enforcement

**Support does not include:**
- Custom feature development outside the pilot scope
- Production deployment work (pilot environment only)
- Regulatory certification or legal compliance opinions
- Integration engineering into the pilot participant's internal systems
- Data migration, data modeling, or schema design for production use

---

## Response Times

| Priority | Definition | Response |
|----------|-----------|----------|
| P1 — System unusable | Pilot environment is down or enforcement gate is not producing outcomes | Same business day |
| P2 — Major pilot impact | Enforcement behavior does not match documented invariants; evidence bundles not being produced | Within 24 hours |
| P3 — General issue | Documentation error, configuration question, behavior clarification | Within 3 business days |
| P4 — Enhancement request | Feature or scope expansion outside pilot definition | Reviewed at weekly planning |

Response means: issue acknowledged, severity confirmed, investigation begun. Resolution timelines depend on root cause and are communicated as soon as the investigation scope is clear.

---

## Documentation Requirements

Every pilot engagement maintains the following documentation throughout its duration. Nothing exists only in meetings or email threads.

| Document | Owner | Updated |
|----------|-------|---------|
| Pilot scope | Both parties | Week 1, frozen at kickoff |
| Change log | CerbaSeal | On any configuration or behavior change |
| Open issues list | CerbaSeal | Continuously, shared at each weekly review |
| Decision log | CerbaSeal | On any governance interpretation or scope decision |
| Review notes | Both parties | Within 24 hours of each weekly review call |
| Final findings report | CerbaSeal | At pilot completion |

---

## Founder Availability

If the founder is unavailable for up to 48 hours, the pilot participant retains uninterrupted access to:

- Demo environment: https://cerbaseal.replit.app/
- Enforcement documentation: README, one-page overview, architecture docs
- Security documentation: /security portal page, trust boundary documentation
- Review portal: /review, /pilot, /deployment, /one-page portal pages
- Previously exported proof snapshots: docs/reports/proof-snapshot.json (stableChecksum verifiable independently)
- Invariant registry: architecture/invariants/invariant-registry.yaml
- Issue queue: reviewed on return

**On return:** all open P1 and P2 issues are handled first, in severity order. P3 and P4 issues are handled within their standard response windows, with the clock restarted from the return date.

**What does not pause during unavailability:**
- Evidence review of already-produced artifacts (documentation is sufficient)
- Reading and interpreting the proof snapshot (stableChecksum is self-describing)
- Review of all governance documentation (no founder presence required)
- Validation script re-execution (pnpm audit:repo, pnpm verify:proof)

**What pauses during unavailability:**
- New issue investigation requiring live code changes
- Configuration changes to the pilot environment
- Scheduled review calls (rescheduled on return)

---

## Pilot Exit Deliverables

At pilot completion, the following are delivered to the pilot participant:

| Deliverable | Description |
|-------------|-------------|
| Final findings report | Summary of governance outcomes observed during the pilot, issues encountered, and resolutions |
| Governance assessment | Evaluation of whether the identified workflow was governed as specified in the pilot scope |
| Identified gaps | Documented gaps between what CerbaSeal currently enforces and what the pilot participant's production requirements would need |
| Recommended next steps | Specific, bounded recommendations based on pilot findings — not a sales document |
| Exported evidence artifacts | All evidence bundles produced during the pilot, exported via pnpm export:proof |
| Technical summary | Architecture decisions made during configuration, invariants exercised, and enforcement metrics |

**The pilot participant keeps all pilot artifacts.** This includes all documentation, evidence bundles, proof snapshots, and the final findings report. No artifact is withheld.

---

## What This Model Does Not Require

This model does not require a larger team to operate. It requires that the process exists and is followed.

The self-certifying properties of CerbaSeal (audit script, proof export, invariant coverage, always-live portal) are specifically designed to reduce the founder's presence required per engagement. The pilot participant can verify governance state, read evidence bundles, and re-run the audit independently.

What the founder provides is not availability for every question. It is structured accountability: documented process, tracked issues, defined response times, and a final report that is useful regardless of what happens next.
