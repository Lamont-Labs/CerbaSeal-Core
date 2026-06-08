/**
 * CerbaSeal Pilot Configuration Generator
 *
 * Reads a wizard-input.json file and generates a complete pilot configuration package:
 *   - cerbaseal-config.json     — CerbaSeal field map for this client
 *   - pilot-checklist.md        — Personalized deployment checklist
 *   - scenario-test.ts          — TypeScript test for the three core scenarios
 *   - deployment-summary.md     — Deployment environment summary
 *
 * Usage:
 *   pnpm generate:pilot-config
 *   pnpm generate:pilot-config --input wizard-input.json --output ./pilot-config
 *
 * See scripts/wizard-input.example.json for the input format.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");

function getArg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1]! : fallback;
}

const INPUT_PATH = getArg("--input", join(ROOT, "wizard-input.json"));
const OUTPUT_DIR = getArg("--output", join(ROOT, "pilot-config"));

interface WizardAction {
  name: string;
  description?: string;
  consequential: boolean;
  reversible: "yes" | "no" | "partially";
}

interface WizardApprover {
  clientRoleName: string;
  authorityClass: string;
  description?: string;
}

interface WizardInput {
  workflow: {
    name: string;
    description: string;
    frequency: string;
    environment: string;
    industry: string;
  };
  actions: WizardAction[];
  aiSystem: {
    description: string;
    modelVersion?: string;
    hostingLocation: string;
    canSelfAuthorize: boolean;
  };
  approvers: WizardApprover[];
  approval: {
    required: boolean;
    actionsRequiringApproval: string[];
    method: string;
    holdBehavior: string;
  };
  evidence: {
    auditLogPath: string;
    retentionPeriod: string;
    owner: string;
    accessRoles: string[];
    hmacSigning: boolean;
  };
  deployment: {
    mode: string;
    os: string;
    nodeInstalled: boolean;
    pnpmInstalled: boolean;
    writeAccessToAuditLogPath: boolean;
  };
}

function toSnakeCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function validate(input: WizardInput): string[] {
  const errors: string[] = [];
  if (!input.workflow?.name?.trim()) errors.push("workflow.name is required");
  if (!input.workflow?.description?.trim()) errors.push("workflow.description is required");
  if (!input.actions?.length) errors.push("at least one action is required");
  if (!input.approvers?.length) errors.push("at least one approver is required");
  if (!input.evidence?.auditLogPath?.trim()) errors.push("evidence.auditLogPath is required");
  if (input.aiSystem?.canSelfAuthorize === true) {
    console.warn("\n  ⚠ WARNING: aiSystem.canSelfAuthorize is true.");
    console.warn("    CerbaSeal enforces that AI cannot authorize its own proposals.");
    console.warn("    If your workflow currently allows this, CerbaSeal will REJECT those requests.");
    console.warn("    This is by design and cannot be changed.\n");
  }
  return errors;
}

function generateConfig(input: WizardInput): object {
  const workflowClass = toSnakeCase(input.workflow.name);
  const actionClasses = input.actions.map(a => toSnakeCase(a.name));
  const approverClasses = input.approvers.map(a => a.authorityClass);

  const coreAuthorityClasses = ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"];
  const extendedClasses = approverClasses.filter(c => !coreAuthorityClasses.includes(c));

  return {
    _generated: {
      by: "CerbaSeal Pilot Configuration Generator",
      from: "wizard-input.json",
      generatedAt: new Date().toISOString(),
      workflowName: input.workflow.name
    },
    workflowClass,
    workflowDescription: input.workflow.description,
    workflowFrequency: input.workflow.frequency,
    environment: input.workflow.environment,
    industry: input.workflow.industry,
    actionClasses: {
      core: ["allow", "hold", "reject", "escalate", "account_hold"],
      clientMapped: actionClasses
    },
    authorityClasses: {
      core: coreAuthorityClasses,
      extended: extendedClasses
    },
    aiSystem: {
      description: input.aiSystem.description,
      modelVersion: input.aiSystem.modelVersion ?? "specify-model-version",
      hostingLocation: input.aiSystem.hostingLocation
    },
    approvers: input.approvers.map(a => ({
      clientRoleName: a.clientRoleName,
      authorityClass: a.authorityClass
    })),
    approvalRequired: input.approval.required,
    approvalMethod: input.approval.method,
    holdBehavior: input.approval.holdBehavior,
    evidence: {
      auditLogPath: input.evidence.auditLogPath,
      retentionPeriod: input.evidence.retentionPeriod,
      owner: input.evidence.owner,
      accessRoles: input.evidence.accessRoles,
      hmacSigning: input.evidence.hmacSigning
    },
    deployment: {
      mode: input.deployment.mode,
      os: input.deployment.os,
      environment: {
        nodeInstalled: input.deployment.nodeInstalled,
        pnpmInstalled: input.deployment.pnpmInstalled,
        writeAccessToAuditLogPath: input.deployment.writeAccessToAuditLogPath
      }
    }
  };
}

function generateChecklist(input: WizardInput): string {
  const workflowClass = toSnakeCase(input.workflow.name);
  const approverNames = input.approvers.map(a => `${a.clientRoleName} (${a.authorityClass})`).join(", ");

  return `# CerbaSeal Pilot Checklist — ${input.workflow.name}

**Generated:** ${new Date().toISOString()}  
**Workflow class:** \`${workflowClass}\`  
**Environment:** ${input.workflow.environment}

---

## Phase 1 — Technical Setup

- [ ] Node.js 18+ installed on target server
- [ ] pnpm installed
- [ ] CerbaSeal-Core source received and extracted
- [ ] \`pnpm install\` — dependencies installed
- [ ] \`pnpm test\` — all tests passing (expect 419/419)
- [ ] \`pnpm audit:repo\` — all audit checks passing (expect 15/15)
- [ ] \`pnpm export:proof\` — stableChecksum confirmed

---

## Phase 2 — Configuration

- [ ] \`cerbaseal.config.json\` updated with workflow class: \`${workflowClass}\`
- [ ] Approver authority classes confirmed: ${approverNames}
${input.approvers.filter(a => !["system","ai","analyst","reviewer","manager","compliance_officer"].includes(a.authorityClass))
  .map(a => `- [ ] Custom authority class \`${a.authorityClass}\` added to cerbaseal.config.json extended array`)
  .join("\n")}
- [ ] Audit log path configured: \`${input.evidence.auditLogPath}\`
- [ ] Audit log directory exists and is writable
${input.evidence.hmacSigning ? "- [ ] CERBASEAL_SIGNING_KEY environment variable set (min 32 characters)" : ""}

---

## Phase 3 — Integration

- [ ] Adapter implemented: your system constructs \`GovernedRequest\` objects
- [ ] Approval bridge implemented: approver action in your system produces \`ApprovalArtifact\`
- [ ] HOLD handler: when gate returns HOLD, approver is notified
- [ ] ALLOW handler: when gate returns ALLOW with \`releaseAuthorization\`, action executes

---

## Phase 4 — Scenario Testing

${input.actions.map(a => {
  const ac = toSnakeCase(a.name);
  const approver = input.approvers[0];
  return `### Action: ${a.name} (\`${ac}\`)

- [ ] **REJECT scenario**: AI actor (\`actorAuthorityClass: "ai"\`) proposes \`${ac}\` — expected outcome: **REJECT**
- [ ] **HOLD scenario**: \`${ac}\` submitted without approval — expected outcome: **HOLD**
${input.approval.actionsRequiringApproval.includes(a.name) && approver
  ? `- [ ] **ALLOW scenario**: \`${ac}\` submitted with \`${approver.authorityClass}\` approval — expected outcome: **ALLOW**`
  : `- [ ] **ALLOW scenario**: \`${ac}\` submitted with valid approval — expected outcome: **ALLOW**`}`;
}).join("\n\n")}

---

## Phase 5 — Evidence Verification

- [ ] Evidence bundle generated for each scenario
- [ ] \`pnpm export:proof\` passes after scenarios
- [ ] \`pnpm verify:proof\` passes
- [ ] Audit log file contains entries at: \`${input.evidence.auditLogPath}\`
- [ ] \`pnpm generate:evidence-report\` — governance report generated

---

## Phase 6 — Training

- [ ] Technical owner has reviewed: \`docs/client-adoption/training/admin-guide.md\`
- [ ] Operational reviewers have reviewed: \`docs/client-adoption/training/operator-guide.md\`
- [ ] Approvers have reviewed: \`docs/client-adoption/training/reviewer-guide.md\`
- [ ] FAQ reviewed: \`docs/client-adoption/training/faq.md\`
- [ ] Support boundaries confirmed: \`docs/client-adoption/support-boundaries.md\`

---

## Sign-off

| Item | Owner | Status |
|---|---|---|
| Technical deployment | Client technical lead | ☐ |
| Scenario tests passing | Client technical lead | ☐ |
| Evidence bundle verified | Line Axia | ☐ |
| Training complete | Client operational lead | ☐ |
| Pilot declared active | Line Axia + Client | ☐ |

---

*Generated by \`pnpm generate:pilot-config\` from wizard-input.json*
`;
}

function generateScenarioTest(input: WizardInput): string {
  const workflowClass = toSnakeCase(input.workflow.name);
  const firstAction = input.actions[0];
  const firstActionClass = firstAction ? toSnakeCase(firstAction.name) : "escalate";
  const approver = input.approvers[0];
  const approverClass = approver?.authorityClass ?? "analyst";

  return `/**
 * CerbaSeal Scenario Test — ${input.workflow.name}
 *
 * Generated by pnpm generate:pilot-config
 * Workflow class: ${workflowClass}
 *
 * Run: pnpm tsx pilot-config/scenario-test.ts
 */

import { ExecutionGateService } from "./src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "./src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "./src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "./src/config/cerbaseal-config.js";
import type { GovernedRequest, ApprovalArtifact } from "./src/domain/types/core.js";

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);

function nowIso(): string { return new Date().toISOString(); }

const BASE_REQUEST: GovernedRequest = {
  requestId: "scenario-test-001",
  workflowClass: "${workflowClass}" as any,
  jurisdiction: "EU",
  actorId: "test-actor-001",
  actorAuthorityClass: "${approverClass}" as any,
  proposedActionClass: "${firstActionClass}" as any,
  proposal: {
    proposalSourceKind: "ai",
    authorityBearing: false,
    requestedActionClass: "${firstActionClass}" as any,
    confidence: 0.87,
    reasonCodes: ["test_signal_001"],
    proposalCreatedAt: "2026-01-01T00:00:00.000Z"
  },
  sensitive: true,
  prohibitedUse: false,
  policyPackRef: { id: "policy_${workflowClass}_v1", version: "1.0.0" },
  provenanceRef: {
    modelVersion: "${input.aiSystem.modelVersion ?? "model-v1.0"}",
    ruleSetVersion: "rules-1.0.0",
    sourceHash: "sha256:test_rules_hash"
  },
  approvalRequired: ${input.approval.required},
  approvalArtifact: null,
  loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_test_001" },
  trustState: { trusted: true, trustStateId: "ts_test_001" },
  createdAt: "2026-01-01T00:00:00.000Z"
};

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log("  [PASS]", label);
    passed++;
  } else {
    console.error("  [FAIL]", label, detail ? \`— \${detail}\` : "");
    failed++;
  }
}

console.log("\\nCerbaSeal Scenario Tests — ${input.workflow.name}\\n");

// Scenario 1: REJECT — AI cannot self-authorize
console.log("Scenario 1: REJECT — AI actor attempts self-authorization");
const rejectRequest = {
  ...BASE_REQUEST,
  requestId: "scenario-reject-001",
  actorAuthorityClass: "ai" as const,
  actorId: "ai-agent-001",
  approvalRequired: false,
  approvalArtifact: null
};
const rejectResult = gate.evaluate(rejectRequest as any);
assert("finalState is REJECT", rejectResult.decisionEnvelope.finalState === "REJECT");
assert("releaseAuthorization is null", rejectResult.releaseAuthorization === null);
assert("blockedActionRecord is present", rejectResult.blockedActionRecord !== null);
console.log();

// Scenario 2: HOLD — approval required but missing
console.log("Scenario 2: HOLD — approval required but not supplied");
const holdRequest = {
  ...BASE_REQUEST,
  requestId: "scenario-hold-001",
  approvalRequired: true,
  approvalArtifact: null
};
const holdResult = gate.evaluate(holdRequest as any);
assert("finalState is HOLD", holdResult.decisionEnvelope.finalState === "HOLD");
assert("releaseAuthorization is null", holdResult.releaseAuthorization === null);
console.log();

// Scenario 3: ALLOW — valid request with approval
console.log("Scenario 3: ALLOW — valid request with ${approverClass} approval");
const allowRequestId = "scenario-allow-001";
const approval: ApprovalArtifact = {
  approvalId: "approval-test-001",
  approverId: "approver-001",
  forRequestId: allowRequestId,
  approverAuthorityClass: "${approverClass}" as any,
  privilegedAuthSatisfied: true,
  immutableSignature: "sig_test_approver_001",
  approvedAt: "2026-01-01T00:05:00.000Z"
};
const allowRequest = {
  ...BASE_REQUEST,
  requestId: allowRequestId,
  approvalArtifact: approval
};
const allowResult = gate.evaluate(allowRequest as any);
assert("finalState is ALLOW", allowResult.decisionEnvelope.finalState === "ALLOW");
assert("releaseAuthorization is present", allowResult.releaseAuthorization !== null);
assert("releaseAuthorization.forRequestId matches", allowResult.releaseAuthorization?.requestId === allowRequestId);

const bundle = evidenceService.createBundle({ request: allowRequest as any, gateResult: allowResult });
assert("evidence bundle created", bundle.evidenceBundleId === \`evidence_\${allowRequestId}\`);
assert("audit chain valid", logService.verifyChain());
console.log();

console.log(\`Results: \${passed} passed, \${failed} failed\`);
if (failed > 0) {
  console.error("\\nScenario tests FAILED. Do not proceed to production.\\n");
  process.exit(1);
} else {
  console.log("\\nAll scenario tests passed. Pilot verification complete.\\n");
}
`;
}

function generateDeploymentSummary(input: WizardInput): string {
  const workflowClass = toSnakeCase(input.workflow.name);
  const hmacEnvSection = input.evidence.hmacSigning
    ? "# Required (HMAC signing enabled): Signing key (min 32 characters)\nexport CERBASEAL_SIGNING_KEY=\"your-signing-key-here\""
    : "# Optional: HMAC signing (set to enable)\n# export CERBASEAL_SIGNING_KEY=\"your-signing-key-here\"";

  return `# CerbaSeal Deployment Summary — ${input.workflow.name}

**Generated:** ${new Date().toISOString()}

---

## Workflow Configuration

| Field | Value |
|---|---|
| Workflow class | \`${workflowClass}\` |
| Workflow name | ${input.workflow.name} |
| Environment | ${input.workflow.environment} |
| Industry | ${input.workflow.industry} |
| Frequency | ${input.workflow.frequency} |

## Actions

| Action name | Action class | Consequential | Reversible |
|---|---|---|---|
${input.actions.map(a => `| ${a.name} | \`${toSnakeCase(a.name)}\` | ${a.consequential ? "Yes" : "No"} | ${a.reversible} |`).join("\n")}

## AI System

| Field | Value |
|---|---|
| Description | ${input.aiSystem.description} |
| Model version | ${input.aiSystem.modelVersion ?? "Not specified"} |
| Hosting | ${input.aiSystem.hostingLocation} |
| Can self-authorize | **${input.aiSystem.canSelfAuthorize ? "⚠ YES — CerbaSeal will REJECT self-authorization attempts" : "No"}** |

## Human Approvers

| Client role name | Authority class |
|---|---|
${input.approvers.map(a => `| ${a.clientRoleName} | \`${a.authorityClass}\` |`).join("\n")}

## Approval Rules

| Field | Value |
|---|---|
| Approval required | ${input.approval.required ? "Yes" : "No"} |
| Actions requiring approval | ${input.approval.actionsRequiringApproval.join(", ") || "None"} |
| Approval method | ${input.approval.method} |
| Hold behavior | ${input.approval.holdBehavior} |

## Evidence Configuration

| Field | Value |
|---|---|
| Audit log path | \`${input.evidence.auditLogPath}\` |
| Retention period | ${input.evidence.retentionPeriod} |
| Evidence owner | ${input.evidence.owner} |
| Access roles | ${input.evidence.accessRoles.join(", ")} |
| HMAC signing | ${input.evidence.hmacSigning ? "Yes — CERBASEAL_SIGNING_KEY required" : "No"} |

## Deployment Environment

| Field | Value |
|---|---|
| Deployment mode | ${input.deployment.mode} |
| Operating system | ${input.deployment.os} |
| Node.js installed | ${input.deployment.nodeInstalled ? "Yes" : "⚠ No — must be installed before deployment"} |
| pnpm installed | ${input.deployment.pnpmInstalled ? "Yes" : "⚠ No — must be installed before deployment"} |
| Write access to audit log path | ${input.deployment.writeAccessToAuditLogPath ? "Yes" : "⚠ No — must be resolved before deployment"} |

## Environment Variables Required

\`\`\`bash
# Required: Audit log path
export CERBASEAL_AUDIT_LOG_PATH="${input.evidence.auditLogPath}"

${hmacEnvSection}
\`\`\`

## Deployment Checklist Pre-Flight

Before deployment, all of the following must be true:

- [ ] Node.js 18+ installed
- [ ] pnpm installed  
- [ ] \`pnpm install\` completed
- [ ] \`pnpm test\` — 419/419 passing
- [ ] \`pnpm audit:repo\` — 15/15 passing
- [ ] \`cerbaseal.config.json\` created with workflow and authority class configuration
- [ ] Audit log directory exists and is writable at: \`${input.evidence.auditLogPath}\`
- [ ] Environment variables set

See \`pilot-checklist.md\` for the full pilot checklist.

---

*Generated by \`pnpm generate:pilot-config\` from wizard-input.json*
`;
}

async function main(): Promise<void> {
  console.log("\nCerbaSeal Pilot Configuration Generator\n");

  if (!existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    console.error(`Copy scripts/wizard-input.example.json to wizard-input.json and fill in your values.`);
    process.exit(1);
  }

  const raw = readFileSync(INPUT_PATH, "utf-8");
  const input = JSON.parse(raw) as WizardInput;

  const errors = validate(input);
  if (errors.length > 0) {
    console.error("Validation errors in wizard-input.json:");
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const config = generateConfig(input);
  writeFileSync(join(OUTPUT_DIR, "cerbaseal-config.json"), JSON.stringify(config, null, 2) + "\n", "utf-8");
  console.log("  ✓ cerbaseal-config.json");

  const checklist = generateChecklist(input);
  writeFileSync(join(OUTPUT_DIR, "pilot-checklist.md"), checklist, "utf-8");
  console.log("  ✓ pilot-checklist.md");

  const scenarioTest = generateScenarioTest(input);
  writeFileSync(join(OUTPUT_DIR, "scenario-test.ts"), scenarioTest, "utf-8");
  console.log("  ✓ scenario-test.ts");

  const deploymentSummary = generateDeploymentSummary(input);
  writeFileSync(join(OUTPUT_DIR, "deployment-summary.md"), deploymentSummary, "utf-8");
  console.log("  ✓ deployment-summary.md");

  console.log(`\nPilot configuration package written to: ${OUTPUT_DIR}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review ${OUTPUT_DIR}/cerbaseal-config.json`);
  console.log(`  2. Complete ${OUTPUT_DIR}/pilot-checklist.md`);
  console.log(`  3. Run ${OUTPUT_DIR}/scenario-test.ts after deployment`);
  console.log(`  4. Review ${OUTPUT_DIR}/deployment-summary.md with the client\n`);
}

main().catch((e: unknown) => {
  console.error("Generator error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
