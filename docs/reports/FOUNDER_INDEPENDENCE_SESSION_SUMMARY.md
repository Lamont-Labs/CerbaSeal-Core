# CerbaSeal — Founder Independence Session Summary

**Prepared:** 2026-06-05  
**For:** Line Axia call preparation  
**Author:** Jesse Lamont / Lamont Labs  
**Version:** 0.1.0

---

## What This Session Addressed

Olivia raised founder dependency from six angles across the second call: Jesse's time, his full-time job, timezone differences, support expectations, pilot scalability, training burden, client onboarding, and long-term sustainability.

This session built the Founder Independence Program — 7 new documents (plus 7 earlier) that together create the infrastructure for Line Axia to sell, qualify, onboard, deploy, train, and support CerbaSeal pilot clients without requiring Jesse for most of it.

---

## The Founder Independence Program — Complete

### What Was Built (This Session)

| Document | What It Does | Who Uses It |
|---|---|---|
| `founder-dependency-reduction-plan.md` | Maps all 8 dependency layers, mitigation status, what genuinely requires Jesse | Internal reference, Line Axia leadership |
| `pilot-delivery-playbook.md` | Week-by-week delivery guide: who does what, expected outputs, Jesse hours target ≤8 | Line Axia (delivery) |
| `client-discovery-script.md` | Full 60-minute discovery call guide — Line Axia runs it without Jesse | Line Axia (Olivia, Tina) |
| `client-qualification-scorecard.md` | Green/Yellow/Red scoring matrix — 51-point scale, disqualifiers included | Line Axia (Olivia, Tina) |
| `support-boundaries.md` | What support includes and excludes; 3-tier model; support decision tree | Line Axia (all), clients |
| `train-the-trainer-program.md` | 7-module program to certify Line Axia to train clients independently | Line Axia (internal) |
| `frequently-asked-objections.md` | 18 objections with full responses, what to concede, what to hold | Line Axia (sales) |

### What Was Built (Prior Session — Also This Week)

| Document | What It Does |
|---|---|
| `client-readiness-assessment.md` | 10-section scored qualification rubric |
| `workflow-mapping-workbook.md` | A–M facilitated session guide with CerbaSeal Field Map |
| `pilot-success-framework.md` | Agreed success criteria for all three parties |
| `quickstart-deployment-guide.md` | 15-min / 60-min / half-day deployment paths |
| `troubleshooting-guide.md` | Symptom-indexed with safe actions and escalation |
| `client-admin-guide.md` | Admin responsibilities, audit ownership, security boundary |
| `pilot-sizing-and-pricing-framework.md` | 3 tiers, pricing factors, no locked numbers |
| `eu-ai-act-nis2-mapping-support.md` | Art.12/14/NIS2 framing with careful compliance language |
| `line-axia-partner-enablement-pack.md` | 30-sec/2-min pitches, objection handling, when to bring Jesse |
| `self-service-configuration-wizard-spec.md` | 10-step wizard design spec for future self-service |
| 4 governance templates | Fraud triage, transaction escalation, account hold, generic |
| 8 training guides | All roles covered; getting-started, operator, reviewer, admin, FAQ, errors, 30-min agenda, 10-min executive |

**Total:** 29 adoption pack documents

---

## Founder Dependency — Layer by Layer Status

| Layer | Dependency | Status |
|---|---|---|
| 1 — Sales | Line Axia needs Jesse for calls | ✓ Mitigated — discovery script, scorecard, objection guide |
| 2 — Onboarding | Every pilot starts blank | ✓ Mitigated — workflow workbook, templates |
| 3 — Deployment | Client can't deploy without Jesse | ✓ Mitigated — quickstart, runbook, checklist |
| 4 — Training | Training requires Jesse | ✓ Mitigated — all-role training kit, train-the-trainer |
| 5 — Operations | Clients call Jesse when anything happens | ✓ Mitigated — diagnostics layer, troubleshooting guide |
| 6 — Support | Jesse answers support questions | ✓ Mitigated — tiered model, decision tree, FAQ |
| 7 — Knowledge | Knowledge in Jesse's head only | ✓ Partially mitigated — FAQ, FAQ, error guide seeded; accumulation process pending |
| 8 — Founder replacement test | Untested | ⏳ Pending Pilot 1 — measure actual Jesse hours by layer |

---

## What Genuinely Requires Jesse (After All Mitigations)

| Interaction | Frequency Estimate |
|---|---|
| Code-level bug in enforcement core | Very rare |
| `GATE_INTERNAL_REJECT` investigation | Very rare |
| New workflow class (new code) | Once per pilot |
| New authority class (new code) | Once per pilot |
| Deep technical validation for sophisticated buyer | Once per prospect |
| Commercial agreement signing | Once per pilot |

**Target:** Jesse averages ≤ 8 hours per Tier 2 pilot.

---

## Technical State — All Checks Passing

### Enforcement Core

```
391 / 391 tests passing (16 test files)
15  / 15  audit checks passing
12  / 12  invariants covered and linked to tests
229 validator assertions (106 + 13 + 110 across 3 validators)
stableChecksum: 82fa1380edf2f7540d1c73d89fa314d8f80d169c7d14309716b63bec6c917b61
Status: VERIFIED
```

### Phases Implemented and Tested

| Phase | What | Status |
|---|---|---|
| Phase 1 | File-backed persistent audit log (JSONL, hash-chain across restarts), shared audit-hash-utils | ✓ 12 new tests |
| Phase 2 | Deployment docs (runbook, mode-c-client-controlled, pilot-deployment-checklist) | ✓ All 3 docs complete |
| Phase 3 | GitHub Actions CI/CD — full pipeline on every push to main | ✓ `.github/workflows/audit.yml` |
| Phase 4 | Optional HMAC-SHA256 proof snapshot signing via `CERBASEAL_SIGNING_KEY` | ✓ export + verify scripts |
| Phase 5 | Actor authority class runtime hardening — 6 valid values enforced, unknown → REJECT | ✓ Tests in misuse-scenarios |
| Phase 6 | Approval timestamp validation — `approvedAt` must not predate `createdAt` | ✓ Tests in misuse-scenarios |
| Phase 7 | Security docs (artifact-signing-roadmap, access-control-and-rate-limiting) | ✓ Both docs complete |

### Misuse Scenarios — Now 34 Tests (was 27)

The misuse scenario test file now covers:
- Case 1: Unknown actorAuthorityClass (4 tests) — Phase 5
- Case 2: ApprovalArtifact bad requestId binding (3 tests)
- Case 2b: Approval timestamp predates request (4 tests) — Phase 6
- Case 3: approvalRequired: false on fraud_triage (2 tests)
- Case 4: trustState.trusted = false (2 tests)
- Case 5: loggingReady = false (2 tests)
- Case 6: Malformed proposal (4 tests)
- Case 7: Partial EvidenceBundle creation (3 tests)
- Final guard: Exhaustive ALLOW check across all misuse cases (10 tests)

---

## CI/CD Pipeline — What It Does

Every push to `main` runs:

```yaml
1. TypeScript check (tsc --noEmit)
2. Full test suite (391 tests)
3. Import boundary check
4. Invariant coverage check (12/12)
5. Full repo audit (15/15 checks)
6. Export proof snapshot (with optional HMAC signing)
7. Verify proof snapshot
8. Upload proof-snapshot.json as GitHub artifact (90-day retention)
```

HMAC signing uses `CERBASEAL_SIGNING_KEY` GitHub repository secret. Without the secret, the pipeline runs unsigned — all checksum verification still works.

---

## What Line Axia Can Do Now (Without Calling Jesse)

**Qualify a prospect:**
1. Run the 60-minute discovery call using `client-discovery-script.md`
2. Score with `client-qualification-scorecard.md` (51-point Green/Yellow/Red)
3. Advance to workflow mapping or decline — independently

**Onboard a client:**
1. Facilitate the 30-minute kick-off using `training/30-minute-onboarding-agenda.md`
2. Run the workflow mapping session using `workflow-mapping-workbook.md`
3. Configure using the completed CerbaSeal Field Map

**Train a client:**
1. Distribute role-specific guides (operator, reviewer, admin, getting-started)
2. Run the 30-minute onboarding session
3. Answer Tier 1 support questions from FAQ and troubleshooting guide

**Handle support:**
1. Use `support-boundaries.md` decision tree to route any question
2. Answer Tier 1 (documentation) and Tier 2 (interpretation) independently
3. Escalate only Tier 3 (code-level) to Jesse — via email, not phone

**Respond to objections:**
1. Open `frequently-asked-objections.md` — 18 objections with full responses
2. Know what to concede and what to hold

---

## What's Still Open

| Item | Notes |
|---|---|
| Third-party security review | Post-pilot hardening — mentioned in all security docs |
| Pilot 1 working agreement | Commercial agreement, support terms, IP, data handling |
| Pricing finalization | ✓ Working ranges established: Tier 2 (first real pilot) €35K–€75K; recommended starting target €45K–€60K; full 5-tier matrix in pilot-sizing-and-pricing-framework.md |
| Exclusivity terms | Olivia asked — needs Jesse's position |
| Pilot 1 client | Line Axia's pipeline — Jesse awaits their candidate |
| Knowledge accumulation after Pilot 1 | Add every new question to FAQ/troubleshooting; measure Jesse hours by layer |

---

## Recommended Agenda for Next Line Axia Call

1. **Confirm Olivia has reviewed the adoption pack** (10 min)
   - Walk the discovery script structure — can Olivia run that call?
   - Walk the qualification scorecard — does it match their instincts?
   - Walk the objection guide — does it cover the pushback they're seeing?

2. **Address open commercial questions** (15 min)
   - Exclusivity conditions — what would Jesse accept?
   - Support hours per pilot — what's realistic given full-time job?
   - Pricing tiers — does the framework match Line Axia's expectations?

3. **Identify first pilot candidate** (10 min)
   - Who in Line Axia's pipeline scored Green or Yellow on the qualification scorecard?
   - What's their timeline? What workflow?

4. **Define next steps** (5 min)
   - Olivia runs a discovery call (next 2 weeks)
   - Jesse reviews output and scores prospect
   - If Green/Yellow: schedule workflow mapping session

---

## File Locations

All adoption pack documents: `docs/client-adoption/`

```
docs/client-adoption/
├── client-readiness-assessment.md
├── client-discovery-script.md           ← NEW
├── client-qualification-scorecard.md    ← NEW
├── client-admin-guide.md
├── eu-ai-act-nis2-mapping-support.md
├── founder-dependency-reduction-plan.md ← NEW
├── frequently-asked-objections.md       ← NEW
├── line-axia-partner-enablement-pack.md
├── pilot-delivery-playbook.md           ← NEW
├── pilot-sizing-and-pricing-framework.md
├── pilot-success-framework.md
├── quickstart-deployment-guide.md
├── self-service-configuration-wizard-spec.md
├── support-boundaries.md                ← NEW
├── train-the-trainer-program.md         ← NEW
├── troubleshooting-guide.md
├── workflow-mapping-workbook.md
├── templates/
│   ├── account-hold-recommendation-template.md
│   ├── fraud-triage-template.md
│   ├── generic-human-approval-template.md
│   └── transaction-escalation-template.md
└── training/
    ├── 10-minute-executive-overview.md
    ├── 30-minute-onboarding-agenda.md
    ├── admin-guide.md
    ├── common-errors-and-fixes.md
    ├── faq.md
    ├── getting-started-guide.md
    ├── operator-guide.md
    └── reviewer-guide.md
```
