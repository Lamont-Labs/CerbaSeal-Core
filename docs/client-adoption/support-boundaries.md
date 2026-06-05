# CerbaSeal — Support Boundaries

**Audience:** Line Axia (to communicate to clients), Lamont Labs (internal reference)  
**Purpose:** Define exactly what support includes, what it excludes, and how to route every question without calling Jesse.  
**Version:** 0.1.0

---

## The Support Model

CerbaSeal pilot support is **scoped and time-limited**. It is not open-ended. It is not 24/7. It is not a managed service.

During a pilot, support is structured in three tiers:

| Tier | Who Handles | What It Covers |
|---|---|---|
| **Tier 1 — Self-Service** | Client (using documentation) | Any question answerable by the training kit, FAQ, or troubleshooting guide |
| **Tier 2 — Line Axia** | Line Axia account contact | Questions that require interpretation, workflow advice, or escalation routing |
| **Tier 3 — Lamont Labs** | Jesse Lamont | Code-level issues, unexpected invariant behavior, configuration changes to the enforcement core |

**The goal:** 80% of questions are resolved at Tier 1. 15% at Tier 2. 5% require Tier 3.

If more than 50% of interactions are reaching Tier 3, the documentation has a gap — fix the documentation.

---

## What Support Includes

### During a Pilot Engagement

| Support Type | Who Handles | Examples |
|---|---|---|
| **Deployment assistance** | Tier 2/3 | Help with Step N of the quickstart guide; unexpected error during `pnpm install` |
| **Test failure investigation** | Tier 3 | Tests fail on a clean, unmodified repository — requires code-level diagnosis |
| **Scenario clarification** | Tier 1/2 | "What does reason code X mean?" — check FAQ, then ask Line Axia |
| **Evidence bundle interpretation** | Tier 2 | "What does this audit log entry mean for our compliance context?" — Line Axia advisory |
| **Configuration adjustment** | Tier 2/3 | Adjusting field values within the agreed workflow scope |
| **Proof verification failure** | Tier 3 | `pnpm verify:proof` fails on an unmodified repository |
| **Unexpected enforcement outcome** | Tier 2/3 | A request produces an unexpected ALLOW / HOLD / REJECT |
| **Audit log issues** | Tier 1/2 | Log not writing — check troubleshooting guide first; Line Axia if unresolved |

---

## What Support Does Not Include

Be explicit. Clients need to know this before the pilot starts.

| Not Included | What to Do Instead |
|---|---|
| **New workflow classes** | Define in a new working agreement as a next phase |
| **New feature development** | Define in a new commercial agreement |
| **New integration layers** | New agreement |
| **Infrastructure management** | Client's responsibility |
| **Network configuration** | Client's responsibility |
| **Operating system or server management** | Client's responsibility |
| **Monitoring and alerting setup** | Not in pilot scope |
| **SLA guarantees** | Not in pilot scope |
| **Legal or compliance advice** | Line Axia advisory — not legal advice |
| **Compliance certification** | Cannot be provided — CerbaSeal produces evidence, not certification |
| **24/7 availability** | Support is available within agreed windows |
| **Emergency escalation outside agreed hours** | Defined in working agreement — not default |
| **Custom reporting format** | Standard JSONL output is what's provided |
| **Production hardening beyond the runbook** | Post-pilot commercial scope |

---

## Support Decision Tree

Use this to route any question without calling Jesse.

```
QUESTION RECEIVED
│
├─ Is it answered by the FAQ?
│   → YES: Direct client to faq.md. Issue closed.
│   → NO: Continue.
│
├─ Is it answered by the troubleshooting guide?
│   → YES: Direct client to troubleshooting-guide.md. Issue closed.
│   → NO: Continue.
│
├─ Is it answered by common-errors-and-fixes.md?
│   → YES: Direct client to that document. Issue closed.
│   → NO: Continue.
│
├─ Is it a compliance or regulatory interpretation question?
│   → YES: Line Axia advisory layer handles. Use eu-ai-act-nis2-mapping-support.md.
│   → NO: Continue.
│
├─ Is it a workflow mapping or configuration question?
│   → YES: Line Axia reviews workflow mapping workbook. Re-map if needed.
│          If re-mapping reveals a scope issue → proceed to "scope" branch below.
│   → NO: Continue.
│
├─ Is it a code-level error (GATE_INTERNAL_REJECT, test failure, checksum mismatch)?
│   → YES: Line Axia documents and escalates to Jesse.
│          Include: symptom, requestId, error output, Node.js version, OS, what was tried.
│   → NO: Continue.
│
├─ Is it a request for new functionality or a new workflow?
│   → YES: This is out of scope. Do not escalate to Jesse.
│          Acknowledge the request, document it, and note it for post-pilot commercial discussion.
│   → NO: Continue.
│
└─ Cannot categorize? → Line Axia reviews and makes a routing decision.
```

---

## Response Time Commitments

Response time commitments are defined in the working agreement. The defaults below are guidelines — actual commitments are what's signed.

| Tier | Channel | Default Response Time |
|---|---|---|
| Tier 1 (documentation) | Self-service | Immediate |
| Tier 2 (Line Axia) | Email or agreed channel | Within 1 business day |
| Tier 3 (Jesse via Line Axia) | Escalated through Line Axia | Within 2–3 business days |

**No same-day guarantee for Tier 3.** Jesse works full-time elsewhere and operates across timezones. Urgent issues should be documented clearly and routed through Line Axia for triage.

---

## Hour Allocation

Each pilot has a fixed support hour allocation agreed in the working agreement. Default structure:

| Activity | Estimated Hours | Notes |
|---|---|---|
| Kick-off and onboarding | 2–3 hours | 30-minute onboarding session + preparation |
| Workflow mapping session | 2–3 hours | A–M workbook, Line Axia facilitates |
| Deployment support | 1–2 hours | Standby during client's deployment window |
| Scenario testing support | 1–2 hours | Available for questions during testing |
| Issue resolution | 1–3 hours | Consumed only if issues arise |
| Review and closeout | 1–2 hours | End-of-pilot review session |
| **Total (Tier 2 reference)** | **8–15 hours** | Across the full pilot engagement |

**Jesse's share of the total:** Target ≤ 8 hours for a well-prepared Tier 2 pilot.

**Hour tracking:** Line Axia tracks hours consumed by activity. If >50% of hours are consumed in the first 25% of the pilot, flag it immediately and review scope.

---

## When a Support Request Is Out of Scope

If a client request falls outside the agreed support scope:

1. **Acknowledge the request:** Do not dismiss it. Validate that the client's need is real.
2. **Decline politely and clearly:** *"This is outside the scope of the current pilot agreement."*
3. **Explain what IS in scope:** Reference the working agreement's support boundary.
4. **Offer the path forward:** *"This would be a scope expansion — let's document it and talk about what a next phase would look like."*
5. **Document the request:** Every out-of-scope request is data about what clients actually need. Add it to the lessons learned log.

**Never say:** "That's not possible." Say instead: "That's not in scope for this pilot."

---

## Support Hour Warning Triggers

Line Axia should monitor hour consumption and flag these situations:

| Trigger | What to Do |
|---|---|
| 50% of hours used before Week 2 ends | Scope review immediately. Is the client over-relying on support? Is there a deployment issue? |
| Same question asked 3+ times by the same client | The answer isn't clear enough. Improve the documentation. Escalate to Jesse to improve FAQ or troubleshooting guide. |
| Client bypasses Line Axia and contacts Jesse directly | Remind the client of the support path. Jesse should redirect all direct client contact to Line Axia. |
| A question arrives that isn't covered by any guide | Document it. Route it. Then add the answer to the knowledge base. |
| Out-of-scope requests represent >20% of support interactions | Pilot scope is not holding. Review and reframe expectations immediately. |

---

## Scope Expansion Protocol

If a client's needs grow beyond the agreed pilot scope mid-engagement:

1. **Stop.** Do not informally expand scope.
2. **Document** what the client is requesting and why.
3. **Communicate** to the client that this is beyond the agreed pilot scope.
4. **Bring to Jesse and Line Axia** for a commercial discussion.
5. **Define** the expansion as a next phase with its own agreement.

**Rule:** Scope expansions are a business opportunity, not a support problem. Treat them as such.

---

## What Jesse Needs When Tier 3 Is Escalated

Always include:

- Symptom description (what happened, what was expected)
- Error message or unexpected output (exact text)
- `requestId` if related to a specific evaluation
- CerbaSeal version (`cat package.json | grep version`)
- Node.js version (`node --version`)
- Operating system and server type
- Steps already taken to diagnose
- Which troubleshooting guide sections were followed and what they showed

Without this information, Jesse cannot diagnose the issue and will need to ask — creating a round-trip delay.
