# CerbaSeal — Pilot Success Framework

**Used by:** Line Axia, Lamont Labs, and the pilot client — together  
**Purpose:** Define how all three parties judge whether a pilot worked, before the pilot begins.  
**When to use:** During pilot kick-off, before any deployment begins.

---

## Principle

Success criteria must be agreed before the pilot starts — not evaluated after it ends.

A pilot without agreed success criteria cannot produce a clean outcome. It will be interpreted differently by each party and typically results in scope drift, support overload, or inconclusive results.

This framework defines success separately for each stakeholder, shared failure modes, and end-of-pilot review questions.

---

## Client Success Metrics

The client pilot succeeds if the following are true at the end of the engagement:

### Deployment
- [ ] CerbaSeal is deployed in the client's environment and running
- [ ] The client's technical owner can start, stop, and restart the service independently
- [ ] The file-backed audit log is writing to a client-controlled path

### Workflow Coverage
- [ ] The agreed workflow has been mapped to CerbaSeal configuration
- [ ] At least three representative scenarios have been run through the gate (at minimum one ALLOW, one HOLD, one REJECT)
- [ ] All scenario outputs are stable — same input produces same outcome across repeated runs

### Human Oversight
- [ ] The non-self-authorization invariant is confirmed: AI actor cannot produce ALLOW in any test case
- [ ] HOLD path is confirmed: required approval causes HOLD until approval is present
- [ ] Approval-present path is confirmed: valid approval produces ALLOW

### Evidence and Audit
- [ ] An evidence bundle is generated for every evaluation run during the pilot
- [ ] The audit chain passes verification (`pnpm verify:proof`)
- [ ] The client's operational team can retrieve and read evidence bundles
- [ ] The client understands what the evidence bundle contains and how to use it

### Operational Understanding
- [ ] Client users can distinguish ALLOW / HOLD / REJECT and know what each means for their workflow
- [ ] Client can read a reason code from a REJECT or HOLD and understand the cause
- [ ] Client can run the diagnostic report and interpret the output
- [ ] Client does not require founder involvement for standard diagnostic questions

### Continuation
- [ ] At the end of the pilot, the client can articulate what value they received
- [ ] Client expresses intent to continue, expand, or formally procure (not required for success, but tracked)

---

## Lamont Labs Success Metrics

The Lamont Labs pilot succeeds if the following are true:

### Scope Control
- [ ] Support burden stayed within the agreed hour allocation
- [ ] No emergency requests outside agreed support window required response
- [ ] No production-scale operational expectations were placed on the pilot deployment

### Technical Stability
- [ ] The enforcement core required no redesign during the pilot
- [ ] All issues encountered were bounded, reproducible, and documented
- [ ] No invariant produced an incorrect outcome during the pilot

### Learning and Reuse
- [ ] The pilot produced at least one documented workflow configuration usable as a template
- [ ] Deployment steps for this client's environment are documented and reusable
- [ ] At least one real client question or scenario type is captured for future training material
- [ ] The support scope held — no custom development was performed outside the agreed boundary

### Sustainability
- [ ] Jesse was not the single point of failure for client operations at any point during the pilot
- [ ] The support model (fixed hours, defined scope) worked in practice
- [ ] The pilot could be repeated with a second client without a fundamental rebuild

---

## Line Axia Success Metrics

The Line Axia pilot succeeds if the following are true:

### Client Relationship
- [ ] The client understood what CerbaSeal does and does not do before deployment
- [ ] The advisory framing (Line Axia interprets evidence, CerbaSeal produces it) worked in practice
- [ ] The client's compliance or governance need was addressed in a meaningful way

### Commercial Validation
- [ ] The pilot pricing model held — no renegotiation mid-pilot
- [ ] The compensation structure between Line Axia and Lamont Labs worked as agreed
- [ ] The pilot produced enough evidence to support a post-pilot commercial conversation

### Sales and Scalability
- [ ] The sales pitch for CerbaSeal was clarified by the pilot — what resonated, what did not
- [ ] The client profile (ideal vs. not ideal) is better understood after this pilot
- [ ] At least one improvement to the readiness assessment or workflow mapping process was identified
- [ ] The pilot experience is repeatable for a second client with reduced Line Axia preparation time

---

## Pilot Failure Modes

These are the failure modes that should be actively avoided. If any of these emerge during the pilot, treat them as scope risk and escalate immediately.

| Failure Mode | Early Warning Signs | Response |
|---|---|---|
| Client cannot deploy | Technical contact is unavailable or environment is unprepared after kickoff | Pause. Reschedule deployment with dedicated time. Do not proceed without a working environment. |
| Workflow is too vague to configure | Client cannot answer sections A–D of the workflow mapping workbook | Stop mapping. Require the client to define the workflow more specifically before continuing. |
| Support burden exceeds agreed hours | More than 50% of agreed hours used in first 25% of pilot | Flag immediately. Review scope. Do not extend hours without a formal agreement amendment. |
| Client expects compliance certification | Client asks whether the pilot output certifies EU AI Act, GDPR, or SOC 2 compliance | Clarify in writing. CerbaSeal produces governance evidence. Certification is a separate legal/regulatory process. |
| Scope expands beyond one workflow | Client asks for a second workflow or additional integration mid-pilot | Decline politely. Document request. Scope expansion is a next phase requiring a new agreement. |
| No internal owner during the pilot | Client contact becomes unavailable and no backup is named | Stop all support activity until a named owner is available. |
| Client attempts to use ALLOW as compliance proof to a regulator | Client says they will show the audit log to a regulator as evidence of compliance | Correct immediately. The audit log supports compliance review — it does not certify compliance. |

---

## End-of-Pilot Review Questions

To be answered at the closing session with the client, Line Axia, and Lamont Labs (where applicable):

### Operational Questions
1. Which scenarios ran as expected? Which produced unexpected results?
2. Was the HOLD resolution process clear and workable for the client's team?
3. Were there any invariant rejections that surprised the client? If so, why?
4. Was the diagnostic output readable without external assistance?
5. Was the evidence bundle format useful for the client's audit or compliance context?

### Technical Questions
1. Were there any deployment issues that took longer than expected to resolve?
2. Is the file-backed audit log writing correctly and retaining data across restarts?
3. Did the client's technical owner feel confident managing the deployment?
4. Were there any environment-specific issues that should be documented for future pilots?

### Relationship Questions
1. Was the support scope clear throughout the pilot?
2. Were expectations about what CerbaSeal does and does not do met?
3. What did the client find most valuable?
4. What did the client find most confusing or most limited?
5. Would the client recommend CerbaSeal to a peer organization?

### Commercial Questions
1. Does the client wish to continue or expand?
2. What would a post-pilot commercial arrangement look like from the client's perspective?
3. Did the pricing model feel appropriate for the value received?
4. What should change for the next pilot based on this experience?

---

## Pilot Closeout Deliverables

At the end of every pilot, the following should exist regardless of outcome:

| Deliverable | Owner | Description |
|---|---|---|
| Pilot outcome summary | Line Axia | 1–2 page summary: what ran, what outcomes were produced, success criteria met/not met |
| Workflow configuration record | Lamont Labs | Documented CerbaSeal field map from the workbook, with actual values used |
| Evidence archive | Client | Audit log file, proof snapshot, evidence bundles from pilot runs |
| Support log | Lamont Labs | Record of support requests received, time spent, issues resolved |
| Lessons learned | Line Axia + Lamont Labs | Internal document: what to do differently for the next pilot |
| Client next-steps communication | Line Axia | Written communication to client confirming outcome and proposed next step |

---

## Pilot Duration and Phase Reference

| Phase | Duration | Activities |
|---|---|---|
| Kick-off | 1 session | Agree success criteria, review workbook outputs, confirm deployment environment |
| Deployment | 1–3 days | Install, configure, run tests, validate proof snapshot |
| Scenario testing | 1–2 weeks | Run agreed scenarios, review evidence, resolve issues |
| Review | 1 session | End-of-pilot review using questions above |
| Closeout | 1 week | Produce deliverables, communicate outcome |

*Total pilot duration: approximately 4–6 weeks for a narrow-scope first pilot.*

---

*This framework does not constitute a commercial agreement. Agreed success criteria must be documented in the signed working agreement.*
