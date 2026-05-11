import { execSync, spawn } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");

type Result = { name: string; pass: boolean; reason: string };
const results: Result[] = [];

function pass(name: string, reason: string): void {
  results.push({ name, pass: true, reason });
  console.log(`  ✓ PASS  ${name} — ${reason}`);
}

function fail(name: string, reason: string): void {
  results.push({ name, pass: false, reason });
  console.log(`  ✗ FAIL  ${name}`);
  console.log(`         → ${reason}`);
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function getExecErrorMessage(e: unknown): string {
  if (
    e !== null &&
    typeof e === "object" &&
    ("stdout" in e || "stderr" in e)
  ) {
    const o = e as Record<string, unknown>;
    const combined = [String(o["stdout"] ?? ""), String(o["stderr"] ?? "")].join("\n");
    const firstMeaningful =
      combined.split("\n").find((l) => l.includes("error TS")) ??
      combined.split("\n").find((l) => l.trim().length > 0);
    if (firstMeaningful) return firstMeaningful.trim();
  }
  return getErrorMessage(e);
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

function httpGet(port: number, path: string): Promise<number> {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port, path, timeout: 3000 },
      (res) => { res.resume(); resolve(res.statusCode ?? 0); },
    );
    req.on("error", () => resolve(0));
    req.on("timeout", () => { req.destroy(); resolve(0); });
  });
}

async function waitForServer(port: number, retries = 28): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    if (await httpGet(port, "/") === 200) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function main(): Promise<void> {
  console.log("\nCerbaSeal Repo Audit");
  console.log("=".repeat(52));

  const readmePath = join(ROOT, "README.md");
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf-8") : "";

  // ── Check 1: Full test suite ──────────────────────────────────────────────
  let testCount = 0;
  try {
    const out = execSync("pnpm test", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const m = out.match(/Tests\s+(\d+)\s+passed/);
    testCount = m ? parseInt(m[1], 10) : 0;
    pass("1. Full test suite passes", `${testCount} tests passed`);
  } catch (e: unknown) {
    fail("1. Full test suite passes", getExecErrorMessage(e));
  }

  // ── Check 2: TypeScript compiles without errors ───────────────────────────
  try {
    execSync("npx tsc --noEmit -p tsconfig.json", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    pass("2. TypeScript compiles without errors", "tsc --noEmit clean");
  } catch (e: unknown) {
    fail("2. TypeScript compiles without errors", getExecErrorMessage(e));
  }

  // ── Check 3: README anchor strings ───────────────────────────────────────
  const anchors = [
    { label: "enforcement boundary statement", value: "execution enforcement boundary" },
    { label: "proof section",                  value: "Proven at runtime" },
    { label: "demo URL",                       value: "https://cerbaseal.replit.app/" },
    { label: "version string",                 value: "0.1.0" },
  ];
  const missing = anchors.filter((a) => !readme.includes(a.value));
  if (missing.length === 0) {
    pass("3. README anchor strings present", "all 4 anchors found");
  } else {
    fail("3. README anchor strings present", `missing: ${missing.map((a) => a.label).join(", ")}`);
  }

  // ── Check 4: Portal routes respond 200 ───────────────────────────────────
  const AUDIT_PORT = 57821;
  const ROUTES = [
    "/", "/review", "/pilot", "/security", "/deployment", "/one-page",
    "/api/reject", "/api/hold", "/api/allow",
  ];
  {
    const serverProc = spawn("pnpm", ["demo:web"], {
      cwd: ROOT,
      detached: true,
      env: { ...process.env, PORT: String(AUDIT_PORT) },
      stdio: "pipe",
    });
    serverProc.unref();

    const killServer = (): void => {
      try {
        if (serverProc.pid !== undefined) {
          process.kill(-serverProc.pid, "SIGTERM");
        }
      } catch {
        try { serverProc.kill("SIGTERM"); } catch { /* already gone */ }
      }
    };

    const ready = await waitForServer(AUDIT_PORT);
    if (!ready) {
      killServer();
      fail("4. All portal routes respond 200", "server did not become ready within timeout");
    } else {
      const routeFails: string[] = [];
      for (const route of ROUTES) {
        const code = await httpGet(AUDIT_PORT, route);
        if (code !== 200) routeFails.push(`${route} → HTTP ${code}`);
      }
      killServer();
      await new Promise((r) => setTimeout(r, 400));

      if (routeFails.length === 0) {
        pass("4. All portal routes respond 200", `${ROUTES.length} routes checked`);
      } else {
        fail("4. All portal routes respond 200", routeFails.join("; "));
      }
    }
  }

  // ── Check 5: No src/ file unreferenced in tests or examples ──────────────
  {
    const srcFiles = walkTs(join(ROOT, "src"));
    const searchContent = [
      ...walkTs(join(ROOT, "test")),
      ...walkTs(join(ROOT, "examples")),
    ].map((f) => readFileSync(f, "utf-8")).join("\n");

    const unreferenced: string[] = [];
    for (const f of srcFiles) {
      const stem = basename(f, extname(f));
      if (!searchContent.includes(stem)) unreferenced.push(basename(f));
    }
    if (unreferenced.length === 0) {
      pass("5. No src/ file unreferenced in tests or examples", `all ${srcFiles.length} src files referenced`);
    } else {
      fail("5. No src/ file unreferenced in tests or examples", `unreferenced: ${unreferenced.join(", ")}`);
    }
  }

  // ── Check 6: Invariant registry exists and is non-empty ──────────────────
  {
    const regPath = join(ROOT, "architecture", "invariants", "invariant-registry.yaml");
    if (!existsSync(regPath)) {
      fail("6. Invariant registry exists and is non-empty", "file not found");
    } else {
      const content = readFileSync(regPath, "utf-8").trim();
      if (content.length === 0) {
        fail("6. Invariant registry exists and is non-empty", "file is empty");
      } else {
        const count = (content.match(/^  - id:/gm) ?? []).length;
        pass("6. Invariant registry exists and is non-empty", `${count} invariants registered`);
      }
    }
  }

  // ── Check 7: Known-limitations section present in README ─────────────────
  if (readme.toLowerCase().includes("known limitation")) {
    pass("7. Known-limitations section present in README", "section found");
  } else {
    fail("7. Known-limitations section present in README", '"Known Limitations" section not found in README.md');
  }

  // ── Check 8: Test count in README matches actual ──────────────────────────
  {
    const m = readme.match(/(\d+)\s*\/\s*\d+\s*tests?\s*passing/i);
    if (!m) {
      fail("8. Test count in README matches actual", 'no "N / N tests passing" pattern found in README');
    } else {
      const readmeCount = parseInt(m[1], 10);
      if (testCount === 0) {
        fail("8. Test count in README matches actual", "actual test count unknown (check 1 failed)");
      } else if (readmeCount === testCount) {
        pass("8. Test count in README matches actual", `both report ${testCount} tests`);
      } else {
        fail("8. Test count in README matches actual", `README says ${readmeCount}, actual run reported ${testCount}`);
      }
    }
  }

  // ── Check 9: demo:web:validate ───────────────────────────────────────────
  try {
    const out = execSync("pnpm demo:web:validate", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const m = out.match(/(\d+)\s+passed/i);
    const count = m ? m[1] : "all";
    pass("9. demo:web:validate passes", `${count} assertions passed`);
  } catch (e: unknown) {
    fail("9. demo:web:validate passes", getExecErrorMessage(e));
  }

  // ── Check 10: demo:support:validate ──────────────────────────────────────
  try {
    const out = execSync("pnpm demo:support:validate", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const m = out.match(/(\d+)\s+passed/i);
    const count = m ? m[1] : "all";
    pass("10. demo:support:validate passes", `${count} assertions passed`);
  } catch (e: unknown) {
    fail("10. demo:support:validate passes", getExecErrorMessage(e));
  }

  // ── Check 11: review:validate ─────────────────────────────────────────────
  try {
    const out = execSync("pnpm review:validate", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const m = out.match(/(\d+)\s+passed/i);
    const count = m ? m[1] : "all";
    pass("11. review:validate passes", `${count} assertions passed`);
  } catch (e: unknown) {
    fail("11. review:validate passes", getExecErrorMessage(e));
  }

  // ── Check 12: Import boundary enforcement ────────────────────────────────
  try {
    execSync("pnpm check:imports", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    pass("12. No architectural import boundary violations", "all boundaries clean");
  } catch (e: unknown) {
    fail("12. No architectural import boundary violations", getExecErrorMessage(e));
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(52));
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`${passed} / ${total} checks passed`);

  if (passed < total) {
    console.log("Status: FAIL\n");
    process.exit(1);
  } else {
    console.log("Status: PASS\n");
    process.exit(0);
  }
}

main().catch((e: unknown) => {
  console.error("Audit script error:", getErrorMessage(e));
  process.exit(1);
});
