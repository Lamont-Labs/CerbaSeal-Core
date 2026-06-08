# CerbaSeal — Risk Register and Mitigation Plan

**Audience:** Partner leads, Lamont Labs, pilot scoping  
**Version:** v0.1.0 | June 2026  
**Classification:** Partner Confidential — Authorized Recipients Only

---

## Framing

The strongest external posture is neutral, factual, and operational. Risks should be described as current scope, deployment consideration, roadmap item, or operator responsibility rather than as deficiencies. The goal is to build trust through clarity, not to obscure limitations.

Use the language in the "External Description" column when talking to clients and prospects. Reserve the "Internal Note" framing for partner and Lamont Labs discussions.

---

## Risk Register

| Risk Area | Neutral External Description | Mitigation | Owner |
|-----------|------------------------------|-----------|-------|
| **Security review** | Formal third-party security review is planned as a future milestone | Communicate transparently during pilot kickoff; prepare security review package for v0.2.0 | Lamont Labs |
| **HTTP access control** | The starter server is intentionally minimal; network-level access control is implemented by the operator | Document gateway, VPN, private network, and deployment perimeter assumptions in deployment guide | Operator / partner |
| **Identity provider integration** | CerbaSeal evaluates TrustState but does not operate the client IdP | Clarify integration boundary and required identity assertions during workflow mapping | Partner + client |
| **Configuration complexity** | Policy files provide flexibility but require partner training to author correctly | Build policy pack builder, validation scripts, and workflow wizard; maintain certification framework | Lamont Labs + partner |
| **Production monitoring** | Operational monitoring is environment-specific; CerbaSeal provides health endpoint and audit chain verification | Provide recommended signals, health endpoint documentation, and integration notes; operator implements monitoring | Operator |
| **Founder dependency** | Early pilots may require Lamont Labs involvement for Tier 3 support and roadmap-level changes | Use guided independence model, partner certification, and support boundaries to reduce routine involvement | Lamont Labs |
| **Pricing uncertainty** | Private enterprise pricing is not fully public across comparable vendors | Use evidence-tiered pricing framework; revise after first pilots and observed support effort | Lamont Labs + partner |

---

## What CerbaSeal v0.1.0 Does Not Cover

The following are **out of scope** for v0.1.0. Be explicit about these during pilot kickoff.

| Out of Scope | Context |
|-------------|---------|
| PKI-backed cryptographic signing of DecisionEnvelope | HMAC is available in source; PKI-backed signing is planned for v0.2.0 |
| Third-party penetration testing or independent security audit | Scheduled milestone for v0.2.0 |
| Network-level access control and authentication of HTTP API callers | Operator responsibility; document perimeter assumptions |
| Denial-of-service resilience — rate limiting, circuit breaking, WAF | Operator responsibility |
| Key management infrastructure for approval signatures | v0.1.0 checks presence and non-emptiness of immutableSignature; cryptographic validation planned for v0.2.0 |
| Windows deployment | Not tested in v0.1.0; support posture is unclear |
| AI model quality, correctness, or bias validation | CerbaSeal validates the governance process, not the AI model's output quality |
| Regulatory compliance certification | CerbaSeal is enforcement infrastructure; regulatory compliance certification is a client and counsel matter |
| Production certification | Not offered in v0.1.0 |

---

## What Requires Lamont Labs Tier 3 Escalation

Level 2+ partners are expected to resolve 80%+ of issues independently. The following require direct Lamont Labs involvement:

- New core enforcement invariants — adding a new hard rule requires TypeScript changes and new tests
- New `ProposalSourceKind` values beyond `"ai"` and `"deterministic_rule"`
- PKI-backed cryptographic signing of `DecisionEnvelope` objects
- Third-party security review coordination
- Windows deployment questions
- Gate behavior that cannot be explained by the invariant framework and existing test suite
- Any defect that survives the standard support guide diagnosis path

---

## External Communication Posture

**Use neutral language in all external communications:**

✅ Use: "current scope", "roadmap item", "operator responsibility", "client-controlled deployment", "guided implementation", "defined escalation", "pilot evaluation"

❌ Avoid (internal analysis terms only): "critical gap", "founder bottleneck", "hard blocker", "not production-ready", "unresolved security issue"

**On security review:**
Say: "A formal third-party security review is planned as a milestone for the next major version. We communicate this transparently at pilot kickoff. The current enforcement model has been validated through 391 tests including adversarial bypass scenarios."

**On HTTP access control:**
Say: "The deployment server is intentionally minimal — access control is implemented at the network layer by the operator. This is the same pattern used by other enforcement infrastructure. We document the expected perimeter assumptions."

**On pricing:**
Say: "We price based on deployment scope, support window, and evidence requirements. We don't have a fixed public price because pilot scope varies. Let's define the scope and I'll give you a specific number."

---

## Risk Review Cadence

For partners running their first pilot:
- Review this register during pilot scoping (before deployment)
- Confirm out-of-scope items with the client before work begins
- Document any client-specific risk assumptions in the pilot scope document

For Lamont Labs:
- Review and update this register after each pilot closeout
- Revise after any Tier 3 escalation that reveals a previously undocumented risk
- Update pricing uncertainty section after first commercial pilots complete
