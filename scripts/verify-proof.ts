import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SNAPSHOT_PATH = join(ROOT, "docs", "reports", "proof-snapshot.json");

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

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
}

async function main(): Promise<void> {
  const VERBOSE = !process.argv.includes("--quiet");
  const log = (msg: string): void => { if (VERBOSE) console.log(msg); };

  log("\nCerbaSeal Proof Snapshot Verification");
  log("=".repeat(52));

  if (!existsSync(SNAPSHOT_PATH)) {
    console.error("  ✗ No proof snapshot found at docs/reports/proof-snapshot.json");
    console.error("    Run pnpm export:proof to generate one.");
    process.exit(1);
  }

  let snapshot: ProofSnapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf-8")) as ProofSnapshot;
  } catch (e: unknown) {
    console.error("  ✗ Failed to parse proof snapshot:", getErrorMessage(e));
    process.exit(1);
  }

  let pass = true;

  // ── 1. Verify stableChecksum ───────────────────────────────────────────────
  //
  // stableChecksum = sha256(JSON.stringify(stablePayload, null, 2))
  // stablePayload  = { gitCommit, gitBranch, version, testSuite,
  //                    auditChecks, invariants, validators }
  // (excludes generatedAt, manifestChecksum, stableChecksum)
  //
  const stablePayload = {
    gitCommit:    snapshot.gitCommit,
    gitBranch:    snapshot.gitBranch,
    version:      snapshot.version,
    testSuite:    snapshot.testSuite,
    auditChecks:  snapshot.auditChecks,
    invariants:   snapshot.invariants,
    validators:   snapshot.validators,
  };
  const computedStable = createHash("sha256")
    .update(JSON.stringify(stablePayload, null, 2), "utf-8")
    .digest("hex");

  if (computedStable === snapshot.stableChecksum) {
    log(`  ✓ stableChecksum verified`);
    log(`    ${snapshot.stableChecksum}`);
  } else {
    console.error("  ✗ stableChecksum MISMATCH");
    console.error(`    Expected: ${snapshot.stableChecksum}`);
    console.error(`    Computed: ${computedStable}`);
    console.error("    The enforcement fields have been altered since this snapshot was exported.");
    pass = false;
  }

  // ── 2. Verify manifestChecksum ─────────────────────────────────────────────
  //
  // manifestChecksum = sha256(JSON.stringify(manifestBody, null, 2))
  // manifestBody     = all fields EXCEPT manifestChecksum and stableChecksum
  //
  const manifestBody = {
    generatedAt:  snapshot.generatedAt,
    gitCommit:    snapshot.gitCommit,
    gitBranch:    snapshot.gitBranch,
    version:      snapshot.version,
    testSuite:    snapshot.testSuite,
    auditChecks:  snapshot.auditChecks,
    invariants:   snapshot.invariants,
    validators:   snapshot.validators,
  };
  const computedManifest = createHash("sha256")
    .update(JSON.stringify(manifestBody, null, 2), "utf-8")
    .digest("hex");

  if (computedManifest === snapshot.manifestChecksum) {
    log(`  ✓ manifestChecksum verified`);
    log(`    ${snapshot.manifestChecksum}`);
  } else {
    console.error("  ✗ manifestChecksum MISMATCH");
    console.error(`    Expected: ${snapshot.manifestChecksum}`);
    console.error(`    Computed: ${computedManifest}`);
    console.error("    The snapshot file has been tampered with since it was exported.");
    pass = false;
  }

  // ── 3. Print snapshot summary ─────────────────────────────────────────────
  log("");
  log(`  Snapshot generated: ${snapshot.generatedAt}`);
  log(`  Git commit:         ${snapshot.gitCommit.slice(0, 12)}`);
  log(`  Version:            ${snapshot.version}`);
  log(`  Tests:              ${snapshot.testSuite.passed} / ${snapshot.testSuite.total}`);
  log(`  Audit checks:       ${snapshot.auditChecks.passed} / ${snapshot.auditChecks.total}`);
  log(`  Invariants:         ${snapshot.invariants.total} (allCovered: ${String(snapshot.invariants.allCovered)})`);

  const validatorKeys = Object.keys(snapshot.validators);
  for (const key of validatorKeys) {
    const v = snapshot.validators[key];
    if (v) {
      log(`  ${key}: ${v.assertions} assertions (${v.passed ? "pass" : "FAIL"})`);
    }
  }

  log("\n" + "=".repeat(52));

  if (pass) {
    log("  Status: VERIFIED\n");
    log("  Both checksums match. The snapshot has not been tampered with.");
    log("  The stableChecksum confirms enforcement state at time of export.\n");
    process.exit(0);
  } else {
    console.error("  Status: TAMPERED or CORRUPT\n");
    process.exit(1);
  }
}

main().catch((e: unknown) => {
  console.error("Verify error:", getErrorMessage(e));
  process.exit(1);
});
