# CerbaSeal — Policy Pack Authoring Guide

**Audience:** Client technical owner or system integrator  
**Time required:** 20–40 minutes for a new workflow  
**Prerequisite:** Completed the Readiness Assessment and have a workflow definition in hand  

---

## What Is a Policy Pack?

A policy pack is a single JSON file — `cerbaseal.policy.json` — that tells the CerbaSeal enforcement gate how to behave for your specific deployment. It contains three things:

1. **Actor mappings** — how your organisation's role names translate to CerbaSeal authority classes
2. **Approval chains** — which of your workflows require a human approval before a request can be released
3. **Action policies** — per-workflow rules about which actions are blocked, always require approval, or follow default gate behaviour

Without a policy pack, the gate operates on core invariants only — the enforcement boundary still holds, but it doesn't know anything about your specific roles or approval requirements. The policy pack is how you customise the gate for your deployment.

---

## What a Policy Pack Cannot Do

The policy pack only adds restrictions. It cannot:

- Remove the requirement for a policy pack reference on every request (`policyPackRef` is always required)
- Allow an AI actor to authorise its own proposals (this is a hard invariant, unconditional)
- Remove provenance or logging requirements
- Allow a trust state that is not `trusted: true`

If you need to loosen any of these constraints, that is a product-level question — not a configuration question.

---

## Step 1 — Identify Your Actors

List every type of person or system that will interact with your governed workflow. For each one, decide which CerbaSeal authority class best describes their role.

| CerbaSeal authority class | Meaning |
|---|---|
| `system` | A trusted automated system (not AI) — e.g. an orchestration service |
| `ai` | An AI/ML system making proposals. **Never has approval authority.** |
| `analyst` | An experienced human reviewer — e.g. fraud analyst, operations analyst |
| `reviewer` | A human reviewer — similar to analyst, appropriate for junior roles |
| `manager` | A manager with sign-off authority — e.g. head of risk, operations lead |
| `compliance_officer` | A compliance professional — highest human authority class |

**Example mapping for a fraud operations team:**

```json
"actorMappings": {
  "Senior Fraud Analyst":    "analyst",
  "Fraud Operations Lead":   "analyst",
  "Head of Risk":            "manager",
  "Chief Compliance Officer": "compliance_officer"
}
```

Once you have this section, anyone on your team can pass their role name in API requests and the gate will correctly resolve their authority class. No code change required.

---

## Step 2 — Identify Your Approval Requirements

For each workflow you are governing, decide: does releasing an action on this workflow require a named human to sign off?

Most consequential workflows — fraud decisions, financial approvals, account holds — should require approval. The question is which authority classes are authorised to provide it.

**Example:**

| Your workflow | Approval required? | Who can approve? |
|---|---|---|
| `transaction_fraud_review` | Yes | analyst, manager |
| `account_hold_recommendation` | Yes | manager, compliance_officer |
| `internal_audit_log` | No | — |

```json
"approvalChains": {
  "transaction_fraud_review":       ["analyst", "manager"],
  "account_hold_recommendation":    ["manager", "compliance_officer"]
}
```

Any workflow listed in `approvalChains` will HOLD (and return a `HOLD` decision) if the request arrives without a valid approval artifact. The client must then supply an approval and resubmit.

---

## Step 3 — Define Action Policies

For each workflow, list the action classes that your AI system can propose. For each action, decide:

| Behaviour | Meaning |
|---|---|
| `requires_approval` | Gate HOLDs this action until a human signs off. Use for consequential or irreversible actions. |
| `auto_allow` | No approval required by policy. The gate's core invariants still apply. Use for safe/reversible actions. |
| `blocked` | Gate REJECTs this action immediately, regardless of anything else. Use to prohibit actions your workflow should never take. |

**Example:**

```json
"actionPolicies": {
  "transaction_fraud_review": {
    "escalate":     "requires_approval",
    "hold":         "requires_approval",
    "allow":        "requires_approval",
    "reject":       "auto_allow",
    "account_hold": "requires_approval"
  }
}
```

In this example:
- `reject` is `auto_allow` — rejecting a transaction is considered safe and does not require additional approval
- All other actions require a named human to sign off before the gate issues a release

---

## Step 4 — Assemble the Policy File

Place the completed file at the root of your CerbaSeal deployment directory as `cerbaseal.policy.json`. A minimal working example:

```json
{
  "_schema": "cerbaseal-policy/v1",
  "_description": "Fraud operations policy — Acme Financial Services",

  "actorMappings": {
    "Senior Fraud Analyst":  "analyst",
    "Head of Risk":          "manager"
  },

  "approvalChains": {
    "transaction_fraud_review": ["analyst", "manager"]
  },

  "actionPolicies": {
    "transaction_fraud_review": {
      "escalate":     "requires_approval",
      "hold":         "requires_approval",
      "allow":        "requires_approval",
      "reject":       "auto_allow",
      "account_hold": "requires_approval"
    }
  }
}
```

---

## Step 5 — Load the Policy in Your Integration

```typescript
import { loadCerbaSealPolicy } from "./src/config/cerbaseal-policy.js";
import { loadCerbaSealConfig } from "./src/config/cerbaseal-config.js";
import { ExecutionGateService } from "./src/services/execution/execution-gate-service.js";

const config = loadCerbaSealConfig();   // reads cerbaseal.config.json
const policy = loadCerbaSealPolicy();   // reads cerbaseal.policy.json

const gate = new ExecutionGateService(config, policy);
```

If `cerbaseal.policy.json` does not exist, `loadCerbaSealPolicy()` returns `undefined` and the gate operates on core invariants only. If the file exists but contains invalid JSON, the function throws with a descriptive error message — fix the file before starting the service.

---

## Step 6 — Verify the Policy Loaded Correctly

Run the repository audit:

```bash
pnpm audit:repo
```

Check 16 verifies that if `cerbaseal.policy.json` exists, it parses without error. All 16 checks should pass before you hand off to your technical owner.

You can also verify at runtime by running a test request through the gate and checking that actor mappings are applied:

```typescript
// Before policy: actorAuthorityClass must be a canonical class ("analyst", "manager", etc.)
// After policy: your role name string is accepted and translated
const request = {
  actorAuthorityClass: "Senior Fraud Analyst",  // your role name
  // ... rest of request
};
const result = gate.evaluate(request as GovernedRequest);
// result.decisionEnvelope.finalState will be ALLOW / HOLD / REJECT as expected
```

---

## Troubleshooting

**Policy file exists but gate behaves as if it doesn't:**  
Check that `loadCerbaSealPolicy()` is called and the result is passed to the `ExecutionGateService` constructor as the second argument.

**Actor mapping not working — gate rejects unknown authority class:**  
Verify the key in `actorMappings` exactly matches the string passed in `actorAuthorityClass` on the request (case-sensitive). Check for leading/trailing spaces.

**Action still requires approval even though it's `auto_allow`:**  
`auto_allow` means the policy adds no approval requirement. However, if the workflow is listed in `approvalChains` OR the request has `approvalRequired: true`, approval is still required. `auto_allow` does not override the core approval requirement — it only means the policy itself does not add one.

**Gate REJECTs with `MALFORMED_REQUEST` and you don't know why:**  
Check the `trace.reasonCodes` on the `decisionEnvelope`. A blocked action policy produces `MALFORMED_REQUEST`. Verify your `actionPolicies` section does not have `blocked` set for this action on this workflow.

---

## Reference: Policy File Schema

```json
{
  "_schema": "cerbaseal-policy/v1",
  "_description": "Human-readable description of this policy",

  "actorMappings": {
    "<your role name string>": "<canonical authority class>"
  },

  "approvalChains": {
    "<workflow class>": ["<authority class>", ...]
  },

  "actionPolicies": {
    "<workflow class>": {
      "<action class>": "requires_approval | auto_allow | blocked"
    }
  }
}
```

Fields prefixed with `_` are documentation-only and ignored by the loader.  
All other top-level fields are optional — include only what your deployment needs.
