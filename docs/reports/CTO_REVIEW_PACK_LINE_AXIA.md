
════════════════════════════════════════════════════════════════════
CERBASEAL — CTO-LEVEL PILOT READINESS ASSESSMENT
Prepared for: Olivia Aréchiga (Co-Founder & CTO, Line Axia Consulting)
Repository: CerbaSeal-Core v0.1.0 — Lamont Labs
Assessment Date: 2026-06-02
Evidence base: repository files only — no speculation, no future-state projection
════════════════════════════════════════════════════════════════════

ALL CLAIMS IN THIS DOCUMENT ARE SOURCED FROM REPOSITORY FILES.
WHERE EVIDENCE DOES NOT EXIST, IT IS STATED EXPLICITLY.

════════════════════════════════════════════════════════════════════
PART 1 — OLIVIA'S QUESTIONS
════════════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────────
QUESTION 1
Where is CerbaSeal right now relative to external deployment —
specifically VeraSeal as the first component? What does pilot-ready
mean from your perspective, and what is the gap between the current
state and that bar?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
The name "VeraSeal" does not appear anywhere in this repository. There
is no component, module, file, or reference using that name. The
enforcement core is CerbaSeal itself — specifically the
ExecutionGateService (src/services/execution/execution-gate-service.ts)
and its supporting services. There is no sub-component called VeraSeal
in the current codebase.

CerbaSeal-Core v0.1.0 is a deterministic enforcement library and
browser demo. It is described in its own documentation as "a minimal
reviewable enforcement proof package" and explicitly "not a finished
standalone deployable product." It runs on Node.js/TypeScript with a
single runtime dependency (tsx). It is currently hosted as a
demonstration only at cerbaseal.replit.app.

What is implemented and working:
- Single execution gate with 12 invariants, all enforced in sequence
- ALLOW / HOLD / REJECT outcomes with fail-closed behavior
- Append-only SHA-256 hash-chained audit log
- Evidence bundle generation and export
- Replay consistency verification
- Diagnostic report generation with invariant-level tracing
- 323 passing tests across 15 test files including adversarial,
  security, and boundary probes
- Browser-accessible Review & Pilot Readiness Portal (/review,
  /pilot, /security, /deployment routes)
- 15/15 repo audit checks passing in CI

What is not implemented:
- Persistent storage (audit log is in-memory, lost on restart)
- Cryptographic signing of decision artifacts
- Identity verification or runtime attestation of callers
- Policy content evaluation (policyPackRef is a reference only)
- Client-specific workflow binding
- Production infrastructure hardening
- No third-party security review completed

Pilot-ready, from this repository's own definition
(docs/pilot/pilot-readiness-brief.md):
"One client, one workflow, one decision path, one approval model, one
enforcement promise, one verifiable outcome." The core is ready for
that narrow scope as a controlled technical evaluation — not as a
production deployment.

Gap to that bar:
- Working agreement signed (none exists)
- Client workflow defined and mapped to GovernedRequest schema
- Deployment environment selected and reviewed
- Persistent audit storage integration
- Data processing agreement if EU data is involved
- Third-party security review
- Support terms documented and agreed

EVIDENCE:
- docs/current_maturity.md (explicit maturity statement)
- docs/pilot/pilot-readiness-brief.md (pilot shape and prerequisites)
- docs/status/current-state.md (test counts, enforcement loop)
- docs/deployment/eu-pilot-deployment-posture.md (current demo status)
- src/services/execution/execution-gate-service.ts (enforcement core)
- package.json (v0.1.0, tsx runtime only)
- No file in the repository contains the string "VeraSeal"

GAPS:
- VeraSeal as a named component: No evidence found. Does not exist in
  this repository.
- Production deployment: No evidence found
- Signed pilot client: No evidence found
- Third-party security review: No evidence found

PILOT-READY ANSWER:
"CerbaSeal is the enforcement core — there is no separate component
called VeraSeal in the current build. The core enforcement logic is
implemented, adversarially tested, and documented. What we have today
is a controlled technical proof, not a production deployment. Pilot-
ready for us means: one workflow, one client, controlled environment,
no production execution. The gap to that bar is the working agreement,
the deployment environment, and persistent storage. We can run a
controlled technical evaluation today. Production deployment requires
additional hardening that is documented and scoped."

CONFIDENCE: High — based on direct repository evidence


────────────────────────────────────────────────────────────────────
QUESTION 2
Can CerbaSeal be deployed in a client-controlled or EU-hosted
environment — one that does not require client data to pass through
US-operated infrastructure? Is there a deployment model that achieves
this today, or is it something that would need to be built?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
The architecture supports EU/client-controlled deployment by design.
CerbaSeal has no outbound network calls, no external API dependencies,
no database, and no framework dependencies. It is a self-contained
TypeScript library that can be deployed wherever the client's
infrastructure lives.

Four deployment modes are documented (docs/deployment/deployment-modes.md):
Mode 1 — Embedded library (runs inside client application)
Mode 2 — Internal HTTP service (wrapper around evaluate())
Mode 3 — Sidecar (runs alongside client service)
Mode 4 — Air-gapped evaluation (offline, no network)

The EU posture document (docs/deployment/eu-pilot-deployment-posture.md)
states explicitly: "CerbaSeal does not require outbound network access.
CerbaSeal does not call external APIs. CerbaSeal does not connect to
external databases. CerbaSeal does not transmit data to third-party
services."

For EU pilots, Mode C (client-controlled environment) is the documented
preferred approach: the client selects hosting environment and region,
data does not leave the client-controlled environment, CerbaSeal runs
as a contained service or library.

What does NOT exist yet:
- A deployed EU instance (current demo is Replit-hosted, US)
- A tested deployment playbook for any client environment
- Infrastructure-as-code or containerization artifacts
- A data processing agreement template
- Legal review of EU jurisdiction-specific requirements

The capability is architectural — the code can be deployed in EU
infrastructure. The operational path to doing that has not been
executed.

EVIDENCE:
- docs/deployment/deployment-modes.md (4 deployment modes)
- docs/deployment/eu-pilot-deployment-posture.md (EU posture, explicit
  no-external-call statements)
- package.json (tsx only — no external service dependencies)
- src/services/execution/execution-gate-service.ts (no network calls)

GAPS:
- Tested EU deployment: No evidence found
- Containerization / Dockerfile: No evidence found
- Infrastructure-as-code: No evidence found
- DPA template: No evidence found
- EU legal review: No evidence found

PILOT-READY ANSWER:
"Yes, the architecture supports this — there are no external calls,
no cloud-vendor-specific dependencies, and no data transmitted outside
the deployment environment. The deployment model that achieves data
residency today is client-controlled hosting: you deploy the Node.js
package inside your own EU infrastructure. The current demo runs on
Replit for demonstration purposes only and would not be used for any
real client data. We have not yet executed a EU deployment; the path
exists but hasn't been walked. Before doing so, a data processing
agreement and environment review are prerequisites we've documented."

CONFIDENCE: High for architectural claim / Medium for operational
readiness (deployment has not been tested in a client environment)


────────────────────────────────────────────────────────────────────
QUESTION 3
What would your operational role look like during a pilot? Would you
need to be present throughout, or is there a point at which the client
can operate it independently? What support model makes sense?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
The pilot operations model is fully documented
(docs/pilot-operations-model.md). Key terms:

Week 1: Scoping, baseline deployment, success criteria definition,
workflow mapping, authority matrix definition.

Ongoing: Email support, weekly 30-minute review calls, tracked issue
queue, documented change log and decision log.

Response times documented:
- P1 (system unusable): Same business day
- P2 (major pilot impact): Within 24 hours
- P3 (general issue): Within 3 business days
- P4 (enhancement request): Weekly planning

Founder unavailability clause (docs/pilot-operations-model.md):
"If the founder is unavailable for up to 48 hours, the pilot
participant retains uninterrupted access to: demo environment,
enforcement documentation, security documentation, review portal,
previously exported proof snapshots, invariant registry."

Independent operation is partially supported by design: CerbaSeal is
deterministic, fail-closed, and self-explaining. The system generates
reason codes, diagnostic reports, and operator guidance from every
outcome. Pilot-safe mode (docs/operations/pilot-safe-mode.md) is
designed so that "operators can see why a decision happened, reviewers
can inspect proof output, repeated scenarios produce stable outcomes."

What is not supported without founder involvement:
- New issue investigation requiring live code changes
- Configuration changes to the pilot environment
- Scheduled review calls

What pauses during unavailability is explicitly documented. What
does not pause is also explicitly documented.

EVIDENCE:
- docs/pilot-operations-model.md (full operations model with SLAs)
- docs/operations/solo-support-risk-reduction.md (independence model)
- docs/operations/pilot-safe-mode.md (constrained operating profile)

GAPS:
- Second engineer / backup escalation path: No evidence found
- Managed hosted service: No evidence found
- 24/7 support: Not claimed, explicitly excluded

PILOT-READY ANSWER:
"My role is highest at week one — scoping, deployment, baseline
scenarios, success criteria. After that, the model is weekly check-in
calls, a tracked issue queue, and email support for anything that
comes up. CerbaSeal is designed to be self-explaining: every outcome
generates a reason code and diagnostic trace, so a client-side
operator can understand what happened without needing to call me. I'm
a solo founder today, and I've documented that honestly — including
what happens if I'm unavailable for 48 hours and what doesn't require
my involvement. I won't overcommit. If Line Axia needs a larger
support model, that becomes part of the engagement structure."

CONFIDENCE: High — fully documented in repository


────────────────────────────────────────────────────────────────────
QUESTION 4
What is your realistic capacity for a pilot engagement alongside your
current portfolio development? Is there a timing that works better
than others?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
No evidence in this repository addresses Jesse Lamont's personal
schedule, current portfolio engagements, or capacity constraints.
This is a personal operations question, not a technical question.

EVIDENCE: No evidence found in repository.

GAPS: No repository evidence. This requires Jesse's direct answer.

PILOT-READY ANSWER:
"I don't have other active pilot deployments right now. Week one of
a pilot is the highest-touch period — scoping, deployment, and
baseline. After that, the weekly model is sustainable alongside
ongoing development. That said, I won't give you an answer I can't
back up. If you want to discuss timing on the call, I'll give you
an honest read on what weeks work and what doesn't."

CONFIDENCE: Low — no repository evidence; Jesse should answer directly


────────────────────────────────────────────────────────────────────
QUESTION 5
Are there any open-source components or third-party dependencies in
the deployment stack that we should be aware of for client or supply
chain purposes?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
Runtime dependencies (package.json):
- tsx ^4.21.0 — TypeScript execution engine. MIT license. Used to
  run TypeScript source files directly in Node.js. This is the ONLY
  runtime dependency.

Development dependencies:
- typescript ^5.6.3 — TypeScript compiler. Apache 2.0 license.
  Build-time only, not present in deployment.
- vitest ^2.1.8 — Test framework. MIT license. Test-time only, not
  present in deployment.
- @types/node ^22.10.2 — TypeScript type definitions. MIT license.
  Build-time only, not present in deployment.

No framework dependencies. No database drivers. No cloud SDKs.
No authentication libraries. No HTTP client libraries. No external
service connections.

The enforcement core (ExecutionGateService) has zero external runtime
dependencies beyond Node.js built-ins and tsx.

EVIDENCE:
- package.json (full dependency list)
- src/ (no external imports beyond Node.js built-ins)

GAPS:
- No SBOM (Software Bill of Materials) document: No evidence found
- No formal license audit: No evidence found
- tsx dependency has not been independently security-audited within
  this repository

PILOT-READY ANSWER:
"The runtime deployment has one external dependency: tsx, which is
an MIT-licensed TypeScript runtime used to execute the enforcement
core. There are no framework dependencies, no database drivers, no
cloud SDK calls, and nothing that reaches outside the deployment
environment. Development and test tooling (TypeScript compiler,
Vitest) are not part of the deployment artifact. A formal SBOM and
license audit haven't been produced yet but would be straightforward
given the minimal dependency surface."

CONFIDENCE: High — package.json is definitive


────────────────────────────────────────────────────────────────────
QUESTION 6
How do you want to be compensated for your technical contribution to
a pilot engagement — a fixed fee per deployment, a percentage of the
total engagement fee, or something else?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
No repository document specifies compensation, pricing, revenue
sharing, or fee structure. The pilot readiness brief explicitly
states: "This brief does not include pricing, revenue terms, or
commercial commitments. Those require a separate working agreement."

EVIDENCE: No evidence found in repository.

GAPS: Pricing/compensation model: No evidence found. Not within
repository scope by design.

PILOT-READY ANSWER:
"The repository doesn't specify pricing — that's deliberate; it's
a technical document. My position is: I want a structure that's fair
to both sides, reflects the actual value delivered, and doesn't
create misaligned incentives. I'm open to fixed fee per deployment,
a percentage of engagement revenue, or a hybrid. What I'd want
defined before we start is scope boundary and what counts as change
requests — that matters more than the fee structure. Let's discuss
what feels right on the call."

CONFIDENCE: Low — no repository evidence; Jesse should answer directly


────────────────────────────────────────────────────────────────────
QUESTION 7
The direction note described the relationship as: Line Axia manages
the client relationship, regulatory framing, and commercial structure;
Lamont Labs provides the technical implementation. Does that division
of responsibility feel accurate and workable?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
The repository reflects this division structurally. The technical core
is self-contained and has no client-relationship artifacts, no
commercial materials (beyond the readiness binder), and no regulatory
framing built in. The documentation is written for technical reviewers
and governance advisors — consistent with the assumption that a
commercial partner handles client-facing positioning.

docs/pilot/pilot-readiness-brief.md notes: "This brief does not
include pricing, revenue terms, or commercial commitments. Those
require a separate working agreement."

docs/pilot-operations-model.md defines the technical operations scope
clearly without commercial terms, indicating the technical layer is
intentionally bounded.

EVIDENCE:
- docs/pilot/pilot-readiness-brief.md (scope boundaries)
- docs/pilot-operations-model.md (technical support scope only)
- docs/02-scope-boundary.md

GAPS: Formal partnership agreement: No evidence found.

PILOT-READY ANSWER:
"Yes, that division maps to how the repository is structured. The
technical layer is my scope — enforcement behavior, evidence
generation, deployment assistance, and bug fixes. Client relationship,
regulatory framing, and commercial structure belong with Line Axia.
The one thing I'd want formalized is the boundary between
'configuration within scope' and 'custom development outside scope' —
because that line will come up during a pilot and it needs to be
agreed in writing before we start, not negotiated in the middle of
an engagement."

CONFIDENCE: High for technical alignment / Low for formal agreement
(no agreement exists)


────────────────────────────────────────────────────────────────────
QUESTION 8
Lamont Labs retains full ownership of CerbaSeal and all underlying
architecture. Are there any other IP considerations visible from the
repository or project structure?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
The repository has no LICENSE file. There is no open-source license
declared. There is no copyright notice in source files. There is no
contribution agreement or CLA. The repo is named CerbaSeal-Core under
the Lamont-Labs GitHub organization.

No third-party code has been copied into the repository. All source
files appear to be original work. The only third-party code present
is through declared npm dependencies, all of which are MIT or Apache
2.0 licensed.

The absence of a LICENSE file means the repository is technically
"all rights reserved" by default under copyright law, which is
consistent with proprietary ownership — but is also not explicitly
declared anywhere in the repository.

Evidence artifacts produced by the system (evidence bundles, audit
chains, proof snapshots) are generated outputs. Ownership of those
artifacts during a pilot requires definition — who owns evidence
bundles produced during a client pilot is not addressed in any
repository document.

EVIDENCE:
- Repository root (no LICENSE file present)
- package.json (no license field)
- docs/pilot/pilot-readiness-brief.md: "evidence ownership" listed as
  a required pre-pilot agreement item

GAPS:
- LICENSE file: No evidence found
- Copyright notices in source: No evidence found
- Evidence artifact ownership during pilot: Identified as gap,
  not resolved
- Client-pilot IP assignment clause: No evidence found

PILOT-READY ANSWER:
"Lamont Labs owns CerbaSeal. There's no open-source license on the
repository, which is consistent with proprietary ownership but
should be formalized. One area that needs to be addressed in the
working agreement is evidence artifact ownership — the system
generates audit chains and evidence bundles during a pilot; who owns
those records needs to be explicitly agreed before the pilot starts.
That's already flagged in our pilot prerequisites list. It's a known
gap, not a surprise."

CONFIDENCE: High for observation / Low for formal IP clarity
(no LICENSE file, no formal IP statement)


────────────────────────────────────────────────────────────────────
QUESTION 9
Would a 12-month EU pilot exclusivity arrangement with conversion to
a right of first refusal after 12 months be operationally reasonable
from the project's current state?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
No repository document addresses exclusivity, right of first refusal,
or commercial exclusivity arrangements. The pilot readiness brief does
not include commercial terms by design.

From a purely technical standpoint: the system is a library with no
client-specific code paths baked in. Nothing in the architecture
prevents serving multiple clients from the same codebase. Nothing in
the codebase creates technical lock-in for any party.

Whether a 12-month EU exclusivity arrangement is operationally
reasonable depends entirely on commercial strategy and Jesse's
assessment of opportunity cost — neither of which are in scope for
repository evidence.

EVIDENCE: No evidence found in repository.

GAPS: Exclusivity terms: No evidence found. This is a commercial
decision, not a technical one.

PILOT-READY ANSWER:
"There's nothing in the architecture that creates a technical
dependency on exclusivity — the system doesn't have client-specific
code forks. Whether 12 months of EU exclusivity makes sense commercially
is a business judgment, not a technical one. What I'd want to think
through: what counts as 'EU' for exclusivity purposes, and what
conversion triggers the right-of-first-refusal. Those definitions
matter more than the structure. I'm not opposed to the concept but
I want to understand what we're both agreeing to before I say yes."

CONFIDENCE: Low — no repository evidence; Jesse should answer directly


────────────────────────────────────────────────────────────────────
QUESTION 10
What else should exist in a working agreement before a pilot begins?
────────────────────────────────────────────────────────────────────

CURRENT STATE:
docs/pilot/pilot-readiness-brief.md explicitly lists agreement
prerequisites:
- Commercial terms
- Ownership of evidence records
- Liability boundary
- Support period and scope
- Payment and billing
- Data processing agreement (if applicable)
- Version freeze and update process

docs/deployment/eu-pilot-deployment-posture.md adds:
- Client deployment environment security review
- Data residency and movement review
- Third-party security review of enforcement logic
- Legal review of evidence retention requirements
- Definition of evidence ownership and liability
- Definition of support boundary and escalation path
- Version pinning and change management process
- Persistent audit storage integration

docs/pilot-operations-model.md adds:
- Scope document signed by both parties
- Authority matrix (who proposes, who approves, what is prohibited)
- Pilot success criteria (specific, not open-ended)
- Issue tracking setup

Additionally, not addressed in any document but visible as gaps:
- Governing law and jurisdiction for the agreement
- What happens to the pilot engagement if CerbaSeal is sold or
  transferred
- Change request pricing structure
- Definition of "bug" vs. "feature request" vs. "scope change"
  (the pilot readiness brief defines these but they need to be
  agreed, not just proposed)

EVIDENCE:
- docs/pilot/pilot-readiness-brief.md (explicit prerequisites list)
- docs/deployment/eu-pilot-deployment-posture.md (additional review
  requirements)
- docs/pilot-operations-model.md (documentation and process
  requirements)

GAPS: Governing law clause: No evidence found. Change-of-control
clause: No evidence found. Change request fee structure: No evidence
found.

PILOT-READY ANSWER:
"The repository has a specific prerequisites list. At minimum: a
signed scope document, evidence ownership definition, liability
boundary, support terms, data processing agreement if EU data is
involved, and a version freeze policy. Beyond what's documented, I'd
add: what constitutes a change request and how those are priced, and
governing law. Both of those will come up. The cleaner we are on
paper before we start, the better the pilot goes."

CONFIDENCE: High for repository-evidenced items / Low for items not
yet addressed


════════════════════════════════════════════════════════════════════
PART 2 — CTO REVIEW PACK
════════════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────────
SECTION 1 — TECHNICAL READINESS ASSESSMENT
────────────────────────────────────────────────────────────────────

ENFORCEMENT CORE

Strengths:
- 12 invariants fully implemented, documented, and mapped to tests
  (architecture/invariants/invariant-registry.yaml)
- Gate sequence is deterministic: 13 checks inside evaluate(),
  INV-06 enforced downstream via WeakSet at EvidenceBundleService
  (docs/bounded-autonomy-model.md)
- Seven targeted security fixes applied and tested following a hostile
  audit (docs/status/current-state.md: fixes 1–7 documented)
- Fail-closed is real: unexpected exceptions produce controlled REJECT,
  not silent pass (Fix 6; test/security/fail-closed.test.ts)
- AI non-authority (INV-05) is a hard invariant — not a policy flag
  (docs/bounded-autonomy-model.md: "not configurable at runtime")
- GateResult forgery blocked by WeakSet registry — cannot be
  satisfied by constructing a GateResult outside evaluate()
  (INV-06; test/security/non-forgery.test.ts)

Weaknesses:
- loggingReady, trustState, prohibitedUse are all caller-supplied
  boolean fields. The gate trusts them without independent
  verification. (docs/security/security-review-brief.md: "Known
  Limitations")
- approvedAt has no expiry check, no timestamp format validation
- immutableSignature content is not cryptographically verified —
  any non-empty string passes
- actorAuthorityClass range: only "ai" is specifically matched;
  unknown values are not explicitly rejected
- Objects are not frozen at runtime between evaluate() and
  createBundle() — mutation window exists
  (docs/09-trust-boundary-and-limitations.md)

Blockers:
- No blocker to controlled technical pilot use
- Persistent storage required before any production use
- Cryptographic signing required before legal-weight evidence claims
- Independent identity attestation required before claiming identity
  governance

Pilot risks:
- Caller-declared fields (loggingReady, trustState, prohibitedUse)
  mean the gate's safety guarantees depend on the trustworthiness of
  the upstream caller. In a controlled pilot, this is manageable. In
  production, this requires an integration architecture review.

---

TEST MATURITY

323 passing tests, 0 failing, across 15 test files.

| Test File | Count | Coverage Area |
|---|---|---|
| adversarial-integrity.test.ts | 66 | Bypass attempts, forged inputs |
| execution-gate-service.test.ts | 19 | Core invariant enforcement |
| enforcement-loop.snapshot.test.ts | 41 | Snapshot regression |
| security/misuse-scenarios.test.ts | 27 | Real-world misuse patterns |
| security/contextual-boundary.test.ts | 25 | Enforcement limits |
| integration/review-portal-routes.test.ts | 61 | Portal route coverage |
| integration/browser-demo-routes.test.ts | 28 | Demo server routes |
| integration/support-readiness.test.ts | 23 | Support layer |
| integration/external-signal-examples.test.ts | 16 | Signal examples |
| security/non-forgery.test.ts | 2 | GateResult forgery prevention |
| security/fail-closed.test.ts | 2 | Exception handling |
| audit-evidence-export.test.ts | 6 | Evidence export |
| diagnostic-report-service.test.ts | 5 | Diagnostics |
| integration/full-flow.test.ts | 1 | End-to-end |
| integration/system-integration.test.ts | 1 | System integration |

Strengths:
- Adversarial test coverage is substantive: 66 adversarial +
  27 misuse + 25 boundary + 2 non-forgery + 2 fail-closed = 122
  security-focused tests
- Snapshot tests provide regression protection for enforcement
  behavior changes
- CI pipeline (15 checks) runs on every push and pull request
  against main

Weaknesses:
- full-flow.test.ts and system-integration.test.ts each have 1 test
  — integration coverage is thin
- No e2e tests against a deployed instance
- No property-based or fuzz testing
- No load or stress testing

---

DEPLOYMENT READINESS

Current deployment: Replit-hosted demo at cerbaseal.replit.app.
Suitable for technical review only. Not suitable for client data.

What exists:
- 4 deployment modes documented (embedded, internal service, sidecar,
  air-gapped)
- No external calls, no framework dependencies — deployable anywhere
  Node.js runs
- Single runtime dependency (tsx)

What does not exist:
- No Dockerfile or container configuration
- No infrastructure-as-code
- No deployment playbook or runbook
- No persistent storage integration
- No production environment
- No tested deployment to any client infrastructure

Assessment: Architecturally portable. Operationally undeployed.
A first pilot deployment would be the first time this package is
deployed outside Replit.

---

OPERATIONAL READINESS

What exists:
- Pilot operations model with defined SLAs (docs/pilot-operations-model.md)
- Pilot-safe mode profile (docs/operations/pilot-safe-mode.md)
- Solo-support risk reduction model (docs/operations/solo-support-risk-reduction.md)
- Operator action guidance from reason codes
- Health check and integrity verification services
- Browser-accessible portal for independent review
- Proof snapshot with stableChecksum for independent verification

What does not exist:
- Production monitoring or alerting
- Incident response team (solo founder)
- Backup support resource
- Runbooks for known failure modes
- Managed hosting

---

DOCUMENTATION QUALITY

Strengths:
- The security review brief (docs/security/security-review-brief.md)
  is the most honest self-assessment seen in pre-pilot documentation.
  It lists known limitations accurately and does not overclaim.
- docs/current_maturity.md explicitly states what is real vs. what
  is not yet built
- docs/09-trust-boundary-and-limitations.md documents the trust
  model's structural limits with precision
- Pilot prerequisites, support scope, and out-of-scope items are
  explicitly defined

Weaknesses:
- docs/current_maturity.md states "372 passing tests" while
  docs/status/current-state.md shows a per-file breakdown totaling
  323. These figures are inconsistent within the same repository.
- No deployment runbook exists
- SBOM not produced

---

PILOT SUITABILITY

Overall: Suitable for a controlled technical evaluation with clearly
defined scope. Not suitable for production execution of consequential
decisions.

The enforcement core is real, tested, and honest about its limits.
The operational model is documented. The pilot shape is defined.
The blockers are known and documented — not hidden.


────────────────────────────────────────────────────────────────────
SECTION 2 — PILOT DEPLOYMENT PLAN
────────────────────────────────────────────────────────────────────

TODAY
- Runtime: Node.js + tsx, single process, in-memory state
- Hosting: Replit demo only (cerbaseal.replit.app)
- Data: No client data, no persistence, no credentials
- Audit log: In-memory per process instance, lost on restart
- Deployment: No reproducible deployment outside Replit

FIRST PILOT (what a realistic first pilot deployment looks like)

Architecture:
- CerbaSeal deployed as Mode A (embedded library) or Mode B
  (internal HTTP service) inside client-controlled infrastructure
- Client selects deployment environment and region
- CerbaSeal package installed via npm/pnpm from local source
  (no published npm package exists yet)
- Client's workflow system calls ExecutionGateService.evaluate()
  at the decision boundary
- Evidence bundles written to client-controlled storage (to be
  defined — not built yet in CerbaSeal)

What can be reused from today:
- Full enforcement core (ExecutionGateService + all 12 invariants)
- Evidence bundle generation
- Audit log (in-memory, suitable for pilot evaluation, not production)
- Diagnostic report generation
- Operator action guidance from reason codes
- All test coverage and audit scripts
- Portal documentation and proof snapshot

What must be built for pilot:
- Persistent audit log integration (evidence must survive process
  restart)
- GovernedRequest construction for the specific client workflow
  (CerbaSeal evaluates GovernedRequest objects; the logic that
  constructs them from client events is client-specific —
  docs/current_maturity.md)
- Deployment environment: container, VM, or embedding choice
- API surface if deploying as Mode B (internal HTTP service)

What must be decided before deployment:
- Which deployment mode (library vs. service)
- Who owns deployment engineering
- Where evidence is stored
- What version is frozen for the pilot duration

PRODUCTION (future-state — not built)
- Persistent storage layer
- Cryptographic signing of decision artifacts
- Identity attestation for callers
- Production monitoring and alerting
- Formal SLA
- Multi-client or multi-workflow support
- Published npm package with versioning and changelogs


────────────────────────────────────────────────────────────────────
SECTION 3 — OPERATIONAL SUPPORT PLAN
────────────────────────────────────────────────────────────────────

HOW INCIDENTS ARE HANDLED (from docs/pilot-operations-model.md)

All issues enter a documented queue. Nothing is handled informally.
Every issue receives: Issue ID, severity level, date reported, current
status, resolution notes.

Priority levels:
P1 — System unusable: Same business day response
P2 — Major pilot impact: Within 24 hours
P3 — General issue: Within 3 business days
P4 — Enhancement request: Weekly planning review

SUPPORT PROCESS
- Email reporting → logged to issue queue on receipt
- Issue not considered received without queue entry and ID
- Weekly 30-minute review calls
- Weekly status update: open issues, resolved issues, enforcement
  metrics

ESCALATION PATH
- Single escalation path: Jesse Lamont (founder)
- No secondary escalation resource documented or evidenced
- This is the primary operational risk of a solo-founder engagement

DOCUMENTATION REQUIREMENTS (all required per pilot-operations-model.md)
- Pilot scope document (signed, frozen at kickoff)
- Change log (maintained on any configuration or behavior change)
- Open issues list (continuously updated, shared at each review)
- Decision log (on any governance interpretation or scope decision)
- Review notes (within 24 hours of weekly review call)
- Final findings report (at pilot completion)

FOUNDER DEPENDENCY RISKS (directly from docs/pilot-operations-model.md)
If founder is unavailable up to 48 hours:
- Demo environment, enforcement documentation, security docs, review
  portal, proof snapshots, invariant registry — all accessible without
  founder
- Issue queue reviewed on return
- P1/P2 handled first on return, in severity order
- P3/P4 SLA clock restarted from return date

If founder is unavailable beyond 48 hours: No contingency is
documented. This is a genuine gap.

WHAT HAPPENS IF JESSE IS UNAVAILABLE
Documented self-service:
- pnpm audit:repo — re-run all 15 audit checks independently
- pnpm verify:proof — verify stableChecksum independently
- /review, /pilot, /security, /deployment portal pages accessible
- Evidence bundles readable without Jesse's involvement
- Diagnostic outputs explain themselves via reason codes

Not covered without Jesse:
- New issue investigation requiring code changes
- Configuration changes to pilot environment
- New scenario development
- Deployment changes

HONEST ASSESSMENT OF SOLO SUPPORT RISK:
This is a single-founder operation. The documentation and
self-verifying artifacts reduce (but do not eliminate) the founder
dependency. For a time-sensitive regulatory pilot, the absence of
a secondary escalation resource is a real operational risk that a CTO
should consider before signing a pilot agreement.


────────────────────────────────────────────────────────────────────
SECTION 4 — EU HOSTING FEASIBILITY ASSESSMENT
────────────────────────────────────────────────────────────────────

IMPLEMENTED
- No outbound network calls in any enforcement code path
- No external API dependencies
- No vendor-specific cloud SDK
- No hardcoded infrastructure assumptions
- Single runtime dependency (tsx, MIT licensed, EU-deployable)
- All enforcement logic is self-contained in the Node.js package

FEASIBLE (not yet executed)
- Mode C deployment (client-controlled EU environment) is documented
  as the preferred pilot mode for EU data residency
- Package can be deployed wherever Node.js runs — no architectural
  barrier to EU hosting
- Client selects and controls hosting environment
- Data does not leave client environment by design

UNKNOWN / REQUIRES RESOLUTION
- No EU deployment has been tested or executed
- No data processing agreement template exists
- Legal review of EU jurisdiction requirements: not completed
- Whether tsx itself has any EU-relevant supply chain concerns: not
  assessed
- Persistent audit storage in EU-controlled infrastructure: not
  designed
- GDPR applicability to evidence bundle contents: not assessed
- Whether Replit (current demo host) processes any EU personal data
  during review sessions: not assessed

RISK ASSESSMENT
Low architectural risk: the code does not need to change to support
EU hosting.
Medium operational risk: EU deployment has never been executed and
would require a tested deployment playbook.
High legal/compliance risk: GDPR, evidence retention requirements,
and DPA obligations are unaddressed and require legal input before
a live pilot with real client data.


────────────────────────────────────────────────────────────────────
SECTION 5 — OPEN SOURCE & DEPENDENCY INVENTORY
────────────────────────────────────────────────────────────────────

RUNTIME DEPENDENCIES (package.json)

| Dependency | Version | License | Purpose | Risk | Pilot Impact |
|---|---|---|---|---|---|
| tsx | ^4.21.0 | MIT | TypeScript execution runtime | Low | Required — must be present in all deployments |

BUILD / DEV DEPENDENCIES (not present in deployment artifact)

| Dependency | Version | License | Purpose | Risk | Pilot Impact |
|---|---|---|---|---|---|
| typescript | ^5.6.3 | Apache 2.0 | TypeScript compiler | Low | Build-time only |
| vitest | ^2.1.8 | MIT | Test framework | Low | Test-time only |
| @types/node | ^22.10.2 | MIT | Node.js types | Low | Build-time only |

INFRASTRUCTURE DEPENDENCIES

| Dependency | Details | Risk | Pilot Impact |
|---|---|---|---|
| Node.js | Runtime (version not pinned in package.json) | Medium — version should be pinned for reproducibility | Required in all deployments |
| pnpm | Package manager | Low | Build/install time |
| GitHub Actions | CI/CD (audit.yml) | Low | Runs on github infrastructure — no client data involved |

HOSTING ASSUMPTIONS
Current: Replit (demo only, no client data)
Pilot: Client-controlled (no assumed vendor)

EXTERNAL SERVICES
None. No calls to external APIs, analytics, logging services, identity
providers, or cloud services in any enforcement code path.

NOTABLE FINDING:
The enforcement core at Node.js runtime has exactly one external
dependency (tsx). This is an unusually lean dependency profile for
an enterprise governance tool and is a genuine strength for supply
chain risk management.


────────────────────────────────────────────────────────────────────
SECTION 6 — COMMERCIAL DISCUSSION RECOMMENDATIONS
────────────────────────────────────────────────────────────────────

This section reflects a technical founder's perspective. It is not
legal advice.

PILOT FEES
A fixed pilot fee is technically preferable to a percentage structure
because: pilot scope is defined and bounded (one workflow, one
decision path); percentage structures introduce ambiguity about
what counts as "revenue from the pilot"; and the technical scope
does not scale with the commercial engagement value.

Suggested structure: Fixed fee covering Week 1 scoping + deployment +
defined number of weeks of weekly review + final findings report.
Change requests priced separately at an agreed hourly or per-request
rate.

DEPLOYMENT FEES
The first deployment is the highest-effort deployment. Subsequent
deployments of the same workflow configuration are lower-effort.
A distinction between "initial deployment fee" and "additional
deployment fee" is reasonable.

SUPPORT OBLIGATIONS
The pilot operations model defines what support includes and excludes.
These definitions should be reproduced verbatim in the working
agreement, not summarized. Paraphrasing support scope language in
agreements creates disputes.

Explicitly agree: what is a bug (covered), what is a feature request
(priced separately), and what is a governance concern (covered vs.
advisory — this line matters).

SCOPE BOUNDARIES
The pilot readiness brief defines in-scope and out-of-scope items.
These should be attached as an exhibit to the working agreement, not
incorporated by reference to a document that can be updated.

IP OWNERSHIP
Lamont Labs retains CerbaSeal. Evidence artifacts (bundles, audit
chains, proof snapshots) produced during the pilot should explicitly
belong to the client. This is both the right structure and a
competitive differentiator — clients own their evidence, creating
trust.

EXCLUSIVITY CONSIDERATIONS
From a technical standpoint: exclusivity limits future revenue but
reduces operational complexity during a first pilot (no parallel
deployments, no conflicting client requirements).

12 months is a long commitment for a v0.1.0 product. Consider:
- EU geography exclusivity rather than global
- Exclusivity tied to active engagement (if client fails to engage,
  exclusivity suspends)
- Right of first refusal as conversion is standard and reasonable


────────────────────────────────────────────────────────────────────
SECTION 7 — PILOT RISK REGISTER
────────────────────────────────────────────────────────────────────

| Risk | Severity | Likelihood | Current Mitigation | Remaining Gap |
|---|---|---|---|---|
| Solo founder unavailability | High | Medium | 48-hour self-service model documented; portal, proof snapshot, audit scripts all accessible without founder | No secondary technical resource; no contingency beyond 48 hours |
| Persistent storage absent | High | Certain (for production) | Documented as known gap; pilot-safe mode uses in-memory only | Must be built before any production use; plan not yet defined |
| No third-party security review | High | Certain | Security review brief documents limitations honestly | External security firm not engaged; required before production |
| Caller-supplied field trust | High | Medium | Well-documented; caller is assumed trusted application | No runtime verification; dependent on integration architecture |
| First-ever client deployment | High | Certain | Deployment modes documented; no external calls simplify deployment | First real deployment adds unknown unknowns; no runbook exists |
| Cryptographic signing absent | Medium | Certain | Hash-chaining provides structural integrity; documented clearly | Legal-weight evidence claims require signing; not yet built |
| Test count inconsistency | Low | Certain | Both documents (current_maturity.md vs. status/current-state.md) exist and are readable | Inconsistency (372 vs. 323) should be corrected before external review |
| No LICENSE file | Medium | Certain | IP ownership understood informally | Formal IP declaration absent; should be remedied before any agreement |
| Scope creep | Medium | High | Pilot scope boundaries documented; out-of-scope explicitly defined | Agreement must reproduce scope language verbatim; no signed agreement yet |
| Evidence chain fabrication | Medium | Low | Documented honestly; hash chain proves consistency not origin | Requires HMAC or external attestation to close fully |
| Mutation window (envelope) | Low | Low | Documented; in-memory pilot mitigates real-world exposure | Object.freeze() not called; type annotation only |
| No npm publication | Low | Certain | Local source install works for controlled pilot | Client installation process will be manual; not scalable |


────────────────────────────────────────────────────────────────────
SECTION 8 — QUESTIONS OLIVIA IS MOST LIKELY TO ASK NEXT
────────────────────────────────────────────────────────────────────

Ranked highest to lowest probability based on repository evidence
gaps and the stated audience profile (CTO, regulatory/governance context).

1. "Can you show me the system running on infrastructure we control,
   not Replit?"
   Why: The current demo is on US-hosted Replit. A EU CTO will want to
   see EU-controlled deployment evidence, not a hosted demo.
   Gap: No client deployment has been executed.

2. "What happens to the evidence if the process restarts?"
   Why: In-memory audit log is the most obvious production blocker.
   Any CTO evaluating governance infrastructure will ask this
   immediately.
   Gap: Documented; no solution built yet.

3. "Who else has reviewed the security of this system?"
   Why: No third-party security review has been completed.
   "We reviewed ourselves" is the current answer, however honestly
   documented.
   Gap: No external reviewer; security-review-brief.md documents this.

4. "What happens if you're hit by a bus?"
   Why: Solo founder risk is real. The documentation acknowledges 48-
   hour coverage but has no contingency beyond that.
   Gap: No secondary technical resource.

5. "What version are we freezing for the pilot, and how do you handle
   updates?"
   Why: Version freeze and change management is listed as a
   prerequisite but no version pinning policy exists in the repo.
   Gap: Version freeze policy: not implemented.

6. "Show me the GDPR analysis for this system."
   Why: EU pilot with governance data requires GDPR assessment.
   Gap: No GDPR analysis exists in the repository.

7. "What does 'policy pack reference' actually mean — what policy
   enforcement are we getting?"
   Why: The gate requires policyPackRef but does not evaluate policy
   content. A CTO may expect more.
   Gap: Policy content evaluation is explicitly out of scope;
   docs/current_maturity.md is clear.

8. "Do you have cyber liability insurance?"
   Why: Governance infrastructure for regulated workflows. A
   commercial CTO will ask about insurance coverage.
   Gap: No evidence in repository. Jesse should answer.

9. "What does the working agreement look like?"
   Why: All prerequisites are documented but no agreement exists.
   Gap: No draft working agreement in repository.

10. "How do we know the audit chain wasn't fabricated?"
    Why: SHA-256 without HMAC is documented as a limitation.
    Gap: Acknowledged in security-review-brief.md and
    docs/09-trust-boundary-and-limitations.md; mitigation requires
    HMAC or external attestation, neither of which is built.


════════════════════════════════════════════════════════════════════
PART 3 — EXECUTIVE SUMMARY (ONE-PAGE FOUNDER BRIEFING)
Written for Jesse Lamont. Plain English.
════════════════════════════════════════════════════════════════════

WHAT CERBASEAL ACTUALLY IS TODAY

CerbaSeal is a working enforcement engine for AI-assisted workflows.
When a system asks "should this AI action be allowed to execute?" —
CerbaSeal is the piece that answers that question and produces a
verifiable record of the answer. It works. The enforcement logic is
real, adversarially tested, and honest about where it stops.

What it runs on: Node.js and TypeScript. One runtime dependency.
No external APIs, no database, no cloud vendor lock-in. It is a
self-contained library that can run inside a client's own environment.

Current home: A demonstration on Replit, visible to technical
reviewers. Not connected to any client system.


WHAT IS GENUINELY PILOT-READY

- The enforcement core: fully implemented. All 12 invariants work.
  Fail-closed is real. AI cannot authorize its own proposals —
  this is a hard rule, not a policy flag.
- The test suite: 323 tests passing, including 122 tests specifically
  designed to probe security boundaries and bypass attempts.
- The documentation: unusually honest. The security review brief,
  the maturity document, and the trust boundary document all say
  clearly what works and what doesn't.
- The pilot shape: one client, one workflow, one decision path.
  The operations model for running that is fully documented.
- The audit trail: every outcome produces verifiable evidence.
  The proof snapshot can be independently verified by anyone.


WHAT IS NOT PILOT-READY

- Persistent storage: the audit log disappears when the server
  restarts. This is fine for a demo. It is not fine for a client
  pilot where evidence must survive.
- Cryptographic signing: the evidence chain proves internal
  consistency, not origin. For legal-weight audit evidence, this
  needs to be addressed.
- Deployment: CerbaSeal has never been deployed outside Replit. The
  first client deployment is a first.
- Third-party security review: has not happened. All security
  review to date has been internal.
- A signed agreement with any client: does not exist.


WHAT OLIVIA IS MOST LIKELY EVALUATING

Olivia is evaluating whether you can be trusted as a technical
partner. Specifically: Is the enforcement core real? (Yes.) Is the
documentation honest? (Yes.) Can this survive a pilot? (Conditionally
yes.) Is this production-ready? (No, and you should say so.)

She will probe the gaps. The gaps she is most likely to find are:
in-memory storage, no third-party security review, no EU deployment
executed, and solo-founder operational risk.


WHAT TO CONFIDENTLY SAY

- "CerbaSeal enforces AI governance at the execution boundary. The
  logic is tested, the documentation is honest, and the system is
  designed to fail safe — if something is wrong, it blocks, not
  permits."
- "The enforcement core is ready for a controlled pilot. One workflow,
  one client, controlled environment, no production execution."
- "There is no external call, no cloud vendor dependency, and no data
  leaving the client environment. EU deployment is architecturally
  straightforward."
- "I'm a solo founder. I've documented what that means for support
  and I've built the system so it doesn't require me to interpret
  every outcome."
- "The system is not production-hardened today. I know exactly what
  that means and what it takes to get there."


WHAT NOT TO CLAIM

- Do not claim "VeraSeal" is a component. That name does not exist
  in the repository.
- Do not claim production-readiness for consequential decisions.
- Do not claim the audit chain is cryptographically signed or legally
  attested. It is hash-linked, not signed.
- Do not claim a third-party security review has been completed.
- Do not claim the system protects against malicious caller-supplied
  fields. If the calling application lies about loggingReady or
  trustState, the gate acts on those lies.
- Do not claim any existing client or existing commercial agreement.
  None exists.


BIGGEST STRENGTHS

1. The enforcement core is architecturally real and adversarially
   tested. This is rare at pre-pilot stage.
2. The documentation is honest. A CTO who reads the security review
   brief will trust you more, not less, because you documented the
   gaps before they found them.
3. Zero external dependencies. This is a genuine differentiator for
   EU data residency requirements.
4. The bounded autonomy model is concrete and testable. "AI cannot
   authorize its own proposals" is not a promise in a slide — it is
   a hard invariant with 122 security tests behind it.


BIGGEST RISKS

1. Persistent storage does not exist. This needs to be on the pilot
   requirements list before you agree to anything.
2. Solo-founder operational risk. Be honest about it. Olivia will
   ask. Document the 48-hour model and your plan if the engagement
   grows beyond solo capacity.
3. First client deployment is untested. The architecture supports EU
   hosting; the operational path has not been walked.
4. No third-party security review. For a governance tool in a
   regulated context, this is a credibility gap. Acknowledge it and
   name a plan to address it.


RECOMMENDED POSITION FOR THE CALL

Lead with what is real: a working, honestly documented enforcement
core, ready for a controlled technical evaluation. Be specific about
the pilot shape: one workflow, one client, no production execution.
Name the prerequisites clearly — working agreement, persistent
storage integration, deployment environment selection — and frame
them as things to resolve together, not problems to hide.

The competitive position is not "we're production-ready." The
competitive position is: "We are honest about what we are, we have
built the enforcement logic that most governance products only
describe, and we are ready to prove it in a controlled environment
with defined success criteria."

That is a stronger position than overclaiming. Olivia will test the
claims. The ones above will hold.

════════════════════════════════════════════════════════════════════
END OF ASSESSMENT
Evidence base: CerbaSeal-Core v0.1.0 repository
All claims sourced from repository files. Speculation: none.
════════════════════════════════════════════════════════════════════
