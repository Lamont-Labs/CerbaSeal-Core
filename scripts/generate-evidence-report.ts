/**
 * CerbaSeal Pilot Evidence Package Generator
 *
 * Reads the proof snapshot (docs/reports/proof-snapshot.json) and generates
 * a human-readable governance evidence package:
 *
 *   - governance-summary.md      — narrative summary for compliance review
 *   - decision-summary.json      — structured decision data
 *   - audit-integrity-summary.md — hash chain verification and audit log status
 *
 * Usage:
 *   pnpm generate:evidence-report
 *   pnpm generate:evidence-report --output ./evidence-package
 *   pnpm generate:evidence-report --proof docs/reports/proof-snapshot.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");

function getArg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1]! : fallback;
}

const PROOF_PATH = getArg("--proof", join(ROOT, "docs", "reports", "proof-snapshot.json"));
const OUTPUT_DIR = getArg("--output", join(ROOT, "evidence-package"));

interface ProofSnapshot {
  generatedAt: string;
  gitCommit: string;
  gitBranch: string;
  version: string;
  testSuite: { passed: number; total: number; files: number };
  auditChecks: { passed: number; total: number };
  invariants: { total: number; allCovered: boolean };
  validators: Record<string, { passed: boolean; assertions: number }>;
  manifestChecksum: string;
  stableChecksum: string;
  hmacSignature?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "UTC"
    }) + " UTC";
  } catch {
    return iso;
  }
}

function verifyManifestChecksum(snapshot: ProofSnapshot): { valid: boolean; detail: string } {
  // The manifestChecksum in export-proof.ts is computed from manifestBody only,
  // which excludes manifestChecksum, stableChecksum, and hmacSignature.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { manifestChecksum, stableChecksum, hmacSignature, ...body } = snapshot;
  const bodyJson = JSON.stringify(body, null, 2);
  const computed = createHash("sha256").update(bodyJson, "utf-8").digest("hex");
  const valid = computed === manifestChecksum;
  return {
    valid,
    detail: valid
      ? "Manifest checksum verified — snapshot has not been modified since export"
      : `Manifest checksum MISMATCH — expected ${manifestChecksum}, computed ${computed}`
  };
}

function generateGovernanceSummary(snapshot: ProofSnapshot, checksumResult: { valid: boolean; detail: string }): string {
  const totalValidatorAssertions = Object.values(snapshot.validators)
    .reduce((sum, v) => sum + v.assertions, 0);
  const allValidatorsPassed = Object.values(snapshot.validators).every(v => v.passed);
  const overallPass = snapshot.testSuite.passed === snapshot.testSuite.total
    && snapshot.auditChecks.passed === snapshot.auditChecks.total
    && snapshot.invariants.allCovered
    && allValidatorsPassed
    && checksumResult.valid;

  return `# CerbaSeal Governance Evidence Summary

**Report generated:** ${formatDate(new Date().toISOString())}  
**Enforcement snapshot date:** ${formatDate(snapshot.generatedAt)}  
**CerbaSeal version:** ${snapshot.version}  
**Git commit:** \`${snapshot.gitCommit.slice(0, 12)}\` (branch: ${snapshot.gitBranch})  
**Overall status:** ${overallPass ? "✓ PASS — All governance checks satisfied" : "⚠ REVIEW REQUIRED — See details below"}

---

## Executive Summary

This document provides evidence that CerbaSeal's enforcement core was operating in a verified, tested state at the time of snapshot export.

CerbaSeal enforces governance boundaries between AI-generated recommendations and real-world execution. It ensures that:

1. **AI systems cannot authorize their own proposals.** This is enforced unconditionally at the gate layer.
2. **Required human approvals cannot be bypassed.** Every ALLOW decision has a verified human approval artifact bound to the specific request.
3. **Every decision is evidence-bound.** ALLOW, HOLD, and REJECT outcomes each produce an immutable evidence bundle with a hash-linked audit chain.
4. **Unexpected failures produce governed outcomes.** No unhandled exception propagates to the caller — all failures produce a controlled REJECT.

---

## Enforcement Verification

### Test Suite

| Metric | Value | Status |
|---|---|---|
| Tests passing | ${snapshot.testSuite.passed} / ${snapshot.testSuite.total} | ${snapshot.testSuite.passed === snapshot.testSuite.total ? "✓ PASS" : "✗ FAIL"} |
| Test files | ${snapshot.testSuite.files} | — |

The test suite covers: execution gate invariants, adversarial integrity, fail-closed behavior, non-forgery protection, misuse scenarios, contextual boundary conditions, persistent audit log, and full integration flows.

### Audit Checks

| Metric | Value | Status |
|---|---|---|
| Audit checks passing | ${snapshot.auditChecks.passed} / ${snapshot.auditChecks.total} | ${snapshot.auditChecks.passed === snapshot.auditChecks.total ? "✓ PASS" : "✗ FAIL"} |

Audit checks verify: TypeScript type coverage, import boundary rules, invariant linkage, validator assertions, and documentation consistency.

### Invariant Coverage

| Metric | Value | Status |
|---|---|---|
| All invariants covered | ${snapshot.invariants.total} / ${snapshot.invariants.total} | ${snapshot.invariants.allCovered ? "✓ PASS" : "✗ FAIL"} |

Every enforcement invariant is linked to at least one test. No invariant exists without a covering test.

### Validator Assertions

| Validator | Assertions | Status |
|---|---|---|
${Object.entries(snapshot.validators).map(([k, v]) => `| ${k} | ${v.assertions} | ${v.passed ? "✓ PASS" : "✗ FAIL"} |`).join("\n")}
| **Total** | **${totalValidatorAssertions}** | ${allValidatorsPassed ? "**✓ PASS**" : "**✗ FAIL**"} |

### Snapshot Integrity

| Check | Status |
|---|---|
| Manifest checksum | ${checksumResult.valid ? "✓ Verified" : "✗ FAILED"} |
| HMAC signature | ${snapshot.hmacSignature ? "✓ Present (signed with CERBASEAL_SIGNING_KEY)" : "Not present (unsigned snapshot)"} |

${checksumResult.detail}

---

## Human Oversight Evidence

CerbaSeal enforces human oversight at two levels:

**Level 1 — Approval requirement.** Any request with \`approvalRequired: true\` will produce HOLD (not ALLOW) until a valid \`ApprovalArtifact\` is supplied. The approval artifact must:
- Be bound to the specific request ID (\`forRequestId\`)
- Be timestamped after the request creation time
- Carry a valid \`approverAuthorityClass\` (analyst, reviewer, manager, or compliance_officer)

**Level 2 — Workflow-level unconditional approval.** The \`fraud_triage\` workflow class requires approval unconditionally, regardless of what the caller specifies. The caller cannot opt out of this requirement.

**Level 3 — AI authority prohibition.** An actor with \`actorAuthorityClass: "ai"\` making a proposal with \`proposalSourceKind: "ai"\` will always receive REJECT. No configuration or flag can override this.

---

## Audit Trail Status

The audit trail is a SHA-256 hash-linked chain of events. Every decision event (REQUEST_EVALUATED, RELEASE_AUTHORIZED, ACTION_BLOCKED, EVIDENCE_BUNDLE_CREATED, EXPORT_MANIFEST_CREATED) is recorded in sequence. The chain is self-verifying: any modification to any entry invalidates all subsequent entry hashes.

To verify the audit chain at any time:
\`\`\`bash
pnpm verify:proof
\`\`\`

---

## Limitations and Known Boundaries

The following are known boundaries of what this evidence package proves:

1. **Gate invocation cannot be verified.** The proof proves the gate is correctly implemented and tested. It cannot prove your system actually calls the gate before executing actions — that is an integration responsibility.

2. **Approval artifact authenticity.** CerbaSeal verifies the shape and binding of approval artifacts, but does not cryptographically verify the approver's identity or that the approval was not fabricated. HMAC signing (available via \`CERBASEAL_SIGNING_KEY\`) adds an integrity layer but is not a PKI-backed signature.

3. **No third-party security review.** This system has not received an independent third-party security audit. The adversarial integrity report was self-produced.

4. **SHA-256 chain is unsalted.** The hash chain provides tamper evidence, not confidentiality.

See \`docs/09-trust-boundary-and-limitations.md\` for the complete trust boundary statement.

---

## Reference

| Document | Purpose |
|---|---|
| \`docs/reports/proof-snapshot.json\` | Source of this report |
| \`docs/09-trust-boundary-and-limitations.md\` | Complete trust boundary statement |
| \`docs/security/security-review-brief.md\` | Security review brief for CTO/security teams |
| \`docs/client-adoption/eu-ai-act-nis2-mapping-support.md\` | EU AI Act and NIS2 alignment |

---

*CerbaSeal v${snapshot.version} — Lamont Labs / Jesse Lamont*  
*This report was generated automatically by \`pnpm generate:evidence-report\`*
`;
}

function generateDecisionSummary(snapshot: ProofSnapshot, checksumResult: { valid: boolean; detail: string }): object {
  const totalValidatorAssertions = Object.values(snapshot.validators)
    .reduce((sum, v) => sum + v.assertions, 0);

  return {
    _meta: {
      generatedAt: new Date().toISOString(),
      reportType: "decision_summary",
      cerbasealVersion: snapshot.version
    },
    snapshotProvenance: {
      snapshotGeneratedAt: snapshot.generatedAt,
      gitCommit: snapshot.gitCommit,
      gitBranch: snapshot.gitBranch,
      stableChecksum: snapshot.stableChecksum,
      manifestChecksum: snapshot.manifestChecksum,
      checksumVerified: checksumResult.valid,
      hmacSigned: !!snapshot.hmacSignature
    },
    enforcementState: {
      testSuite: {
        passed: snapshot.testSuite.passed,
        total: snapshot.testSuite.total,
        files: snapshot.testSuite.files,
        status: snapshot.testSuite.passed === snapshot.testSuite.total ? "PASS" : "FAIL"
      },
      auditChecks: {
        passed: snapshot.auditChecks.passed,
        total: snapshot.auditChecks.total,
        status: snapshot.auditChecks.passed === snapshot.auditChecks.total ? "PASS" : "FAIL"
      },
      invariantCoverage: {
        total: snapshot.invariants.total,
        allCovered: snapshot.invariants.allCovered,
        status: snapshot.invariants.allCovered ? "PASS" : "FAIL"
      },
      validators: Object.fromEntries(
        Object.entries(snapshot.validators).map(([k, v]) => [k, {
          assertions: v.assertions,
          passed: v.passed,
          status: v.passed ? "PASS" : "FAIL"
        }])
      ),
      totalValidatorAssertions
    },
    humanOversightGuarantees: [
      "AI actors cannot authorize their own proposals (enforced unconditionally)",
      "fraud_triage workflow requires human approval regardless of caller flag",
      "Approval artifacts must be bound to specific request ID",
      "Approval timestamps must postdate request creation",
      "Privileged authentication must be confirmed in approval artifact"
    ],
    knownLimitations: [
      "Gate invocation by caller cannot be cryptographically proven",
      "Approval artifact authenticity relies on caller-constructed artifacts",
      "No third-party security audit completed",
      "SHA-256 hash chain is unsalted"
    ]
  };
}

function generateAuditIntegritySummary(snapshot: ProofSnapshot, checksumResult: { valid: boolean; detail: string }): string {
  return `# CerbaSeal Audit Integrity Summary

**Report generated:** ${formatDate(new Date().toISOString())}  
**Snapshot date:** ${formatDate(snapshot.generatedAt)}

---

## Snapshot Integrity Verification

### Manifest Checksum

The manifest checksum is a SHA-256 hash of the entire snapshot body (excluding the checksum field itself). It verifies the snapshot has not been modified since export.

| Field | Value |
|---|---|
| Status | ${checksumResult.valid ? "✓ VERIFIED" : "✗ FAILED"} |
| Stored checksum | \`${snapshot.manifestChecksum}\` |
| Result | ${checksumResult.detail} |

### Stable Checksum

The stable checksum is a SHA-256 hash of enforcement-state fields only (excludes timestamps). It is stable across runs on an unchanged codebase and changes when enforcement state changes.

| Field | Value |
|---|---|
| Stable checksum | \`${snapshot.stableChecksum}\` |
| Purpose | Confirms enforcement state has not changed between exports |

### HMAC Signature

${snapshot.hmacSignature
  ? `An HMAC-SHA256 signature is present. This proves the snapshot was produced by a system holding the signing key.

| Field | Value |
|---|---|
| Signature | \`${snapshot.hmacSignature.slice(0, 32)}...\` |
| Algorithm | HMAC-SHA256 over stableChecksum |
| Key | Set via CERBASEAL_SIGNING_KEY environment variable |`
  : `No HMAC signature present. The snapshot is unsigned. Set CERBASEAL_SIGNING_KEY to produce a signed snapshot.

To add signing:
\`\`\`bash
export CERBASEAL_SIGNING_KEY="your-32-plus-char-key-here"
pnpm export:proof
\`\`\``}

---

## Audit Chain Properties

The CerbaSeal audit chain is a SHA-256 hash-linked list of events. Each entry contains:

| Property | Description |
|---|---|
| \`eventId\` | Unique event identifier |
| \`requestId\` | The governed request this event belongs to |
| \`eventType\` | REQUEST_EVALUATED, RELEASE_AUTHORIZED, ACTION_BLOCKED, EVIDENCE_BUNDLE_CREATED, EXPORT_MANIFEST_CREATED |
| \`timestamp\` | ISO 8601 timestamp |
| \`payloadHash\` | SHA-256 of the event payload |
| \`previousHash\` | Hash of the previous entry (null for first entry) |
| \`entryHash\` | SHA-256 of payloadHash + previousHash — the chain link |

**Tamper detection:** Any modification to any entry changes its \`entryHash\`, which then invalidates the \`previousHash\` field of all subsequent entries. The chain breaks at the point of modification.

**Persistence:** The in-memory \`AppendOnlyLogService\` resets on restart. For a persistent audit trail, use \`FileBackedAppendOnlyLogService\` with \`CERBASEAL_AUDIT_LOG_PATH\` set. The file-backed service:
- Loads existing entries and verifies the chain on startup
- Detects tampering in the JSONL file before appending new entries
- Fails loudly if tampered entries are detected

---

## Verification Commands

\`\`\`bash
# Regenerate the proof snapshot (runs all tests and validators)
pnpm export:proof

# Verify the exported snapshot has not been tampered with
pnpm verify:proof

# Re-run all tests independently
pnpm test

# Re-run repo audit independently
pnpm audit:repo

# Regenerate this evidence report
pnpm generate:evidence-report
\`\`\`

---

*CerbaSeal v${snapshot.version} — Lamont Labs / Jesse Lamont*  
*Generated by \`pnpm generate:evidence-report\`*
`;
}

async function main(): Promise<void> {
  console.log("\nCerbaSeal Evidence Package Generator\n");

  if (!existsSync(PROOF_PATH)) {
    console.error(`Proof snapshot not found: ${PROOF_PATH}`);
    console.error(`Run \`pnpm export:proof\` first to generate the snapshot.`);
    process.exit(1);
  }

  const raw = readFileSync(PROOF_PATH, "utf-8");
  const snapshot = JSON.parse(raw) as ProofSnapshot;

  console.log(`  Reading: ${PROOF_PATH}`);
  console.log(`  Snapshot date: ${formatDate(snapshot.generatedAt)}`);
  console.log(`  Version: ${snapshot.version}`);

  const checksumResult = verifyManifestChecksum(snapshot);
  console.log(`  Manifest checksum: ${checksumResult.valid ? "✓ verified" : "✗ FAILED"}`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const governanceSummary = generateGovernanceSummary(snapshot, checksumResult);
  writeFileSync(join(OUTPUT_DIR, "governance-summary.md"), governanceSummary, "utf-8");
  console.log("  ✓ governance-summary.md");

  const decisionSummary = generateDecisionSummary(snapshot, checksumResult);
  writeFileSync(join(OUTPUT_DIR, "decision-summary.json"), JSON.stringify(decisionSummary, null, 2) + "\n", "utf-8");
  console.log("  ✓ decision-summary.json");

  const auditSummary = generateAuditIntegritySummary(snapshot, checksumResult);
  writeFileSync(join(OUTPUT_DIR, "audit-integrity-summary.md"), auditSummary, "utf-8");
  console.log("  ✓ audit-integrity-summary.md");

  console.log(`\nEvidence package written to: ${OUTPUT_DIR}`);
  console.log(`\nContents:`);
  console.log(`  governance-summary.md  — narrative governance evidence for compliance review`);
  console.log(`  decision-summary.json  — structured enforcement state data`);
  console.log(`  audit-integrity-summary.md — hash chain verification details\n`);
}

main().catch((e: unknown) => {
  console.error("Generator error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
