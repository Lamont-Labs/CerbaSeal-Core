import { describe, expect, it } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadCerbaSealPolicy, type CerbaSealPolicy } from "../src/config/cerbaseal-policy.js";
import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";
import type { GovernedRequest } from "../src/domain/types/core.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function tmpPolicyPath(): string {
  return join(tmpdir(), `cerbaseal-policy-test-${Date.now()}.json`);
}

function writeTmpPolicy(content: string): string {
  const path = tmpPolicyPath();
  writeFileSync(path, content, "utf-8");
  return path;
}

function cleanup(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

// ── loadCerbaSealPolicy ───────────────────────────────────────────────────────

describe("loadCerbaSealPolicy", () => {
  it("returns undefined when policy file does not exist", () => {
    const result = loadCerbaSealPolicy("/nonexistent/path/cerbaseal.policy.json");
    expect(result).toBeUndefined();
  });

  it("loads a valid policy file and returns a typed object", () => {
    const path = writeTmpPolicy(JSON.stringify({
      actorMappings: { "Head of Risk": "manager" },
      approvalChains: { "wire_transfer": ["manager"] },
      actionPolicies: { "wire_transfer": { "allow": "requires_approval" } }
    }));
    try {
      const policy = loadCerbaSealPolicy(path);
      expect(policy).toBeDefined();
      expect(policy!.actorMappings!["Head of Risk"]).toBe("manager");
      expect(policy!.approvalChains!["wire_transfer"]).toEqual(["manager"]);
      expect(policy!.actionPolicies!["wire_transfer"]!["allow"]).toBe("requires_approval");
    } finally {
      cleanup(path);
    }
  });

  it("handles a policy with only actorMappings", () => {
    const path = writeTmpPolicy(JSON.stringify({
      actorMappings: { "Analyst Lead": "analyst" }
    }));
    try {
      const policy = loadCerbaSealPolicy(path);
      expect(policy!.actorMappings!["Analyst Lead"]).toBe("analyst");
      expect(policy!.approvalChains).toBeUndefined();
      expect(policy!.actionPolicies).toBeUndefined();
    } finally {
      cleanup(path);
    }
  });

  it("ignores _schema and _description comment fields", () => {
    const path = writeTmpPolicy(JSON.stringify({
      _schema: "cerbaseal-policy/v1",
      _description: "Test policy",
      actorMappings: { "Risk Lead": "manager" }
    }));
    try {
      const policy = loadCerbaSealPolicy(path);
      expect(policy).toBeDefined();
      expect(policy!.actorMappings!["Risk Lead"]).toBe("manager");
    } finally {
      cleanup(path);
    }
  });

  it("throws a descriptive error when the file contains invalid JSON", () => {
    const path = writeTmpPolicy("{ not valid json }");
    try {
      expect(() => loadCerbaSealPolicy(path)).toThrow(/invalid JSON/i);
    } finally {
      cleanup(path);
    }
  });

  it("throws when actorMappings is not an object", () => {
    const path = writeTmpPolicy(JSON.stringify({ actorMappings: ["analyst"] }));
    try {
      expect(() => loadCerbaSealPolicy(path)).toThrow(/actorMappings/);
    } finally {
      cleanup(path);
    }
  });

  it("throws when approvalChains value is not an array of strings", () => {
    const path = writeTmpPolicy(JSON.stringify({
      approvalChains: { "workflow_x": "analyst" }
    }));
    try {
      expect(() => loadCerbaSealPolicy(path)).toThrow(/approvalChains/);
    } finally {
      cleanup(path);
    }
  });

  it("throws when actionPolicies value is not an object", () => {
    const path = writeTmpPolicy(JSON.stringify({
      actionPolicies: { "workflow_x": "requires_approval" }
    }));
    try {
      expect(() => loadCerbaSealPolicy(path)).toThrow(/actionPolicies/);
    } finally {
      cleanup(path);
    }
  });

  it("throws when an action behaviour value is invalid", () => {
    const path = writeTmpPolicy(JSON.stringify({
      actionPolicies: { "workflow_x": { "allow": "always_approve" } }
    }));
    try {
      expect(() => loadCerbaSealPolicy(path)).toThrow(/requires_approval.*auto_allow.*blocked/i);
    } finally {
      cleanup(path);
    }
  });
});

// ── ExecutionGateService with policy — actor mappings ─────────────────────────

describe("ExecutionGateService — policy actor mappings", () => {
  const policy: CerbaSealPolicy = {
    actorMappings: {
      "Head of Risk Operations": "manager",
      "Senior Fraud Analyst":    "analyst"
    }
  };

  it("accepts a mapped client role name and still produces ALLOW", () => {
    const gate = new ExecutionGateService({}, policy);
    const req = buildValidGovernedRequest();
    // Override actor to use client role name (cast required because TypeScript
    // union doesn't include freeform strings — at the REST boundary this arrives
    // as an arbitrary string)
    (req as unknown as Record<string, unknown>)["actorAuthorityClass"] = "Head of Risk Operations";

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
    expect(result.releaseAuthorization).not.toBeNull();
  });

  it("accepts a second mapped role name and still produces ALLOW", () => {
    const gate = new ExecutionGateService({}, policy);
    const req = buildValidGovernedRequest();
    (req as unknown as Record<string, unknown>)["actorAuthorityClass"] = "Senior Fraud Analyst";

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("rejects an unmapped client role name that is not a canonical class", () => {
    const gate = new ExecutionGateService({}, policy);
    const req = buildValidGovernedRequest();
    (req as unknown as Record<string, unknown>)["actorAuthorityClass"] = "Unknown Department Head";

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("MALFORMED_REQUEST");
  });

  it("preserves all existing behaviour when no policy is provided", () => {
    const gate = new ExecutionGateService();
    const req = buildValidGovernedRequest();
    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });
});

// ── ExecutionGateService with policy — approval chains ────────────────────────

describe("ExecutionGateService — policy approval chains", () => {
  it("HOLDs a request when workflow is in approvalChains and no approval artifact is present", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "transaction_escalation": ["analyst", "manager"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.approvalRequired = false;        // caller did not set it
    req.approvalArtifact = null;         // no artifact

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("REQUIRED_APPROVAL_MISSING");
  });

  it("ALLOWs a request when workflow is in approvalChains and a valid approval artifact is present", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "transaction_escalation": ["analyst", "manager"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.approvalRequired = false;  // policy drives the requirement, not the caller flag
    // Approver must be in the configured chain — use "analyst" which is in ["analyst", "manager"]
    req.approvalArtifact = {
      approvalId: "approval_chain_allow",
      approverId: "analyst_001",
      forRequestId: req.requestId,
      approverAuthorityClass: "analyst",
      privilegedAuthSatisfied: true,
      immutableSignature: "sig_chain_allow",
      approvedAt: "2026-04-18T00:01:00.000Z"
    };

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("does not affect workflows not listed in approvalChains", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "account_hold_recommendation": ["compliance_officer"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.approvalRequired = false;
    req.approvalArtifact = null;

    // transaction_escalation is not in approvalChains, so no policy-driven HOLD
    // but fraud_triage is WORKFLOWS_REQUIRING_APPROVAL — use transaction_escalation to avoid that
    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });
});

// ── ExecutionGateService with policy — action policies ────────────────────────

describe("ExecutionGateService — policy action policies", () => {
  it("REJECTs immediately when action is 'blocked' by policy", () => {
    const policy: CerbaSealPolicy = {
      actionPolicies: {
        "fraud_triage": {
          "escalate": "blocked"
        }
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    // req.workflowClass = "fraud_triage" and proposedActionClass = "escalate" by default

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("MALFORMED_REQUEST");
  });

  it("HOLDs when action is 'requires_approval' and no approval artifact is present", () => {
    const policy: CerbaSealPolicy = {
      actionPolicies: {
        "transaction_escalation": {
          "escalate": "requires_approval"
        }
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.proposedActionClass = "escalate";
    req.proposal = { ...req.proposal, requestedActionClass: "escalate" };
    req.approvalRequired = false;
    req.approvalArtifact = null;

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
  });

  it("ALLOWs when action is 'auto_allow' and no approval is otherwise required", () => {
    const policy: CerbaSealPolicy = {
      actionPolicies: {
        "transaction_escalation": {
          "reject": "auto_allow"
        }
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.proposedActionClass = "reject";
    req.proposal = { ...req.proposal, requestedActionClass: "reject" };
    req.approvalRequired = false;
    req.approvalArtifact = null;

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("does not affect other workflows when policy targets a specific workflow", () => {
    const policy: CerbaSealPolicy = {
      actionPolicies: {
        "account_hold_recommendation": {
          "escalate": "blocked"
        }
      }
    };
    const gate = new ExecutionGateService({}, policy);

    // fraud_triage with escalate is NOT blocked by this policy
    const req = buildValidGovernedRequest();
    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });
});

// ── ExecutionGateService with policy — approval chain authority enforcement ───

describe("ExecutionGateService — policy approval chain authority enforcement", () => {
  it("REJECTs when approver is not in the configured chain (chain mismatch)", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "transaction_escalation": ["manager", "compliance_officer"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.approvalRequired = true;
    // Approver is "reviewer" — not in chain ["manager", "compliance_officer"]
    req.approvalArtifact = {
      approvalId: "approval_chain_test",
      approverId: "reviewer_001",
      forRequestId: req.requestId,
      approverAuthorityClass: "reviewer",
      privilegedAuthSatisfied: true,
      immutableSignature: "sig_chain_test",
      approvedAt: "2026-04-18T00:01:00.000Z"
    };

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("INVALID_APPROVAL_AUTHORITY");
  });

  it("ALLOWs when approver is in the configured chain (chain match)", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "transaction_escalation": ["manager", "compliance_officer"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.approvalRequired = true;
    // Approver is "manager" — in chain ["manager", "compliance_officer"]
    req.approvalArtifact = {
      approvalId: "approval_chain_test",
      approverId: "manager_001",
      forRequestId: req.requestId,
      approverAuthorityClass: "manager",
      privilegedAuthSatisfied: true,
      immutableSignature: "sig_chain_match",
      approvedAt: "2026-04-18T00:01:00.000Z"
    };

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
    expect(result.releaseAuthorization).not.toBeNull();
  });

  it("policy-forced HOLD sets humanApprovalRequired=true in the decision envelope", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "transaction_escalation": ["manager"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";
    req.approvalRequired = false;   // caller did NOT set this — policy drives it
    req.approvalArtifact = null;    // no artifact → should HOLD

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    // Envelope must reflect the policy-enforced approval requirement
    expect(result.decisionEnvelope.humanApprovalRequired).toBe(true);
  });

  it("does not restrict approver class when workflow has no approval chain configured", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "account_hold_recommendation": ["compliance_officer"]
      }
    };
    const gate = new ExecutionGateService({}, policy);

    const req = buildValidGovernedRequest();
    req.workflowClass = "transaction_escalation";  // no chain configured for this
    req.approvalRequired = true;
    req.approvalArtifact = {
      approvalId: "approval_no_chain",
      approverId: "reviewer_001",
      forRequestId: req.requestId,
      approverAuthorityClass: "reviewer",  // any valid class passes when no chain
      privilegedAuthSatisfied: true,
      immutableSignature: "sig_no_chain",
      approvedAt: "2026-04-18T00:01:00.000Z"
    };

    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });
});

// ── Backward compatibility ────────────────────────────────────────────────────

describe("ExecutionGateService — backward compatibility without policy", () => {
  it("works identically with no policy argument", () => {
    const gate = new ExecutionGateService();
    const req = buildValidGovernedRequest();
    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
    expect(result.releaseAuthorization).not.toBeNull();
    expect(result.blockedActionRecord).toBeNull();
  });

  it("works identically with undefined policy", () => {
    const gate = new ExecutionGateService({}, undefined);
    const req = buildValidGovernedRequest();
    const result = gate.evaluate(req);
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("getApprovalChains returns empty array when no policy is set", () => {
    const gate = new ExecutionGateService();
    expect(gate.getApprovalChains("fraud_triage")).toEqual([]);
    expect(gate.getApprovalChains("any_workflow")).toEqual([]);
  });

  it("getApprovalChains returns chain from policy when set", () => {
    const policy: CerbaSealPolicy = {
      approvalChains: {
        "fraud_triage": ["analyst", "manager"]
      }
    };
    const gate = new ExecutionGateService({}, policy);
    expect(gate.getApprovalChains("fraud_triage")).toEqual(["analyst", "manager"]);
    expect(gate.getApprovalChains("other_workflow")).toEqual([]);
  });
});
