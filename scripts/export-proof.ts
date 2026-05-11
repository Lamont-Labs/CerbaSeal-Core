import { execSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const STDOUT_MODE = process.argv.includes("--stdout");
const OUT_PATH = join(ROOT, "docs", "reports", "proof-snapshot.json");

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function runCmd(cmd: string): { output: string; ok: boolean } {
  try {
    const output = execSync(cmd, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { output, ok: true };
  } catch (e: unknown) {
    const err = e as Record<string, unknown>;
    const output = [
      String(err["stdout"] ?? ""),
      String(err["stderr"] ?? ""),
      getErrorMessage(e),
    ].join("\n");
    return { output, ok: false };
  }
}

function countAssertions(output: string): number {
  const m = output.match(/Validation complete:\s+(\d+)\s+passed/i);
  if (m) return parseInt(m[1]!, 10);
  return (output.match(/^\s*\[PASS\]/gm) ?? []).length;
}

function walkTs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

async function main(): Promise<void> {
  const steps: Array<{ label: string; ok: boolean }> = [];

  if (!STDOUT_MODE) {
    console.log("\nCerbaSeal Proof Export");
    console.log("=".repeat(52));
  }

  const log = (msg: string): void => { if (!STDOUT_MODE) console.log(msg); };

  // ── 1. Test suite ──────────────────────────────────────────────────────────
  log("  Running test suite...");
  const testRun = runCmd("pnpm test");
  const testPassedM = testRun.output.match(/Tests\s+(\d+)\s+passed/);
  const testPassed = testPassedM ? parseInt(testPassedM[1]!, 10) : 0;
  const testFilesM = testRun.output.match(/Test Files\s+(\d+)\s+passed/);
  const testFiles = testFilesM
    ? parseInt(testFilesM[1]!, 10)
    : walkTs(join(ROOT, "test")).length;
  steps.push({ label: "pnpm test", ok: testRun.ok });
  log(`  ${testRun.ok ? "✓" : "✗"} test suite: ${testPassed} tests, ${testFiles} files`);

  // ── 2. Invariant coverage ─────────────────────────────────────────────────
  log("  Checking invariant coverage...");
  const invRun = runCmd("pnpm check:invariants");
  const invM = invRun.output.match(/(\d+)\s*\/\s*(\d+)\s+invariants?\s+covered/i);
  const invTotal = invM ? parseInt(invM[2]!, 10) : 0;
  const invCovered = invM ? parseInt(invM[1]!, 10) : 0;
  const allCovered = invRun.ok && invTotal > 0 && invCovered === invTotal;
  steps.push({ label: "pnpm check:invariants", ok: invRun.ok });
  log(`  ${invRun.ok ? "✓" : "✗"} invariants: ${invCovered} / ${invTotal} covered`);

  // ── 3. Validators ─────────────────────────────────────────────────────────
  const validators: Record<string, { passed: boolean; assertions: number }> = {};

  const validatorCmds: Array<[string, string]> = [
    ["demo:web:validate", "pnpm demo:web:validate"],
    ["demo:support:validate", "pnpm demo:support:validate"],
    ["review:validate", "pnpm review:validate"],
  ];

  for (const [key, cmd] of validatorCmds) {
    log(`  Running ${cmd}...`);
    const r = runCmd(cmd);
    const assertions = countAssertions(r.output);
    validators[key] = { passed: r.ok, assertions };
    steps.push({ label: cmd, ok: r.ok });
    log(`  ${r.ok ? "✓" : "✗"} ${key}: ${assertions} assertions`);
  }

  // ── 4. Repo audit ─────────────────────────────────────────────────────────
  log("  Running repo audit...");
  const auditRun = runCmd("pnpm audit:repo");
  const auditM = auditRun.output.match(/(\d+)\s*\/\s*(\d+)\s+checks\s+passed/i);
  const auditPassed = auditM ? parseInt(auditM[1]!, 10) : 0;
  const auditTotal = auditM ? parseInt(auditM[2]!, 10) : 0;
  steps.push({ label: "pnpm audit:repo", ok: auditRun.ok });
  log(`  ${auditRun.ok ? "✓" : "✗"} audit: ${auditPassed} / ${auditTotal} checks passed`);

  // ── Abort if any step failed ──────────────────────────────────────────────
  const allPassed = steps.every((s) => s.ok);
  if (!allPassed) {
    const failed = steps.filter((s) => !s.ok).map((s) => s.label);
    console.error("\nProof export aborted: repo is not in a passing state.");
    console.error(`Failed steps: ${failed.join(", ")}`);
    process.exit(1);
  }

  // ── 5. Git provenance ─────────────────────────────────────────────────────
  let gitCommit = "unknown";
  let gitBranch = "unknown";
  try {
    gitCommit = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf-8" }).trim();
    gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT, encoding: "utf-8" }).trim();
  } catch { /* non-fatal — repo may not have git */ }

  // ── 6. Assemble manifest body ─────────────────────────────────────────────
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")) as { version?: string };

  const manifestBody = {
    generatedAt: new Date().toISOString(),
    gitCommit,
    gitBranch,
    version: pkg.version ?? "0.1.0",
    testSuite: { passed: testPassed, total: testPassed, files: testFiles },
    auditChecks: { passed: auditPassed, total: auditTotal },
    invariants: { total: invTotal, allCovered },
    validators,
  };

  // ── 7. Checksum (sha256 of stable enforcement fields — excludes generatedAt
  //       and manifestChecksum itself, so it is stable across runs on an
  //       unchanged repo and can be reproduced for tamper detection) ──────────
  const stablePayload = {
    gitCommit: manifestBody.gitCommit,
    gitBranch: manifestBody.gitBranch,
    version: manifestBody.version,
    testSuite: manifestBody.testSuite,
    auditChecks: manifestBody.auditChecks,
    invariants: manifestBody.invariants,
    validators: manifestBody.validators,
  };
  const stableJson = JSON.stringify(stablePayload, null, 2);
  const manifestChecksum = createHash("sha256").update(stableJson, "utf-8").digest("hex");

  const manifest = { ...manifestBody, manifestChecksum };

  // ── 8. Emit ───────────────────────────────────────────────────────────────
  const finalJson = JSON.stringify(manifest, null, 2) + "\n";

  if (STDOUT_MODE) {
    process.stdout.write(finalJson);
  } else {
    const dir = join(ROOT, "docs", "reports");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(OUT_PATH, finalJson, "utf-8");
    log(`\n  Written to: docs/reports/proof-snapshot.json`);
    log("\n" + "=".repeat(52));
    log(`  manifestChecksum: ${manifestChecksum}`);
    log("  Status: PASS\n");
  }
}

main().catch((e: unknown) => {
  console.error("Export error:", getErrorMessage(e));
  process.exit(1);
});
