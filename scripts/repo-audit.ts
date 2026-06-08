import { execSync, spawn, spawnSync } from "node:child_process";
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

function runAndCapture(cmd: string, args: string[]): { output: string; ok: boolean } {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  const output = (result.stdout ?? "") + (result.stderr ?? "");
  const ok = result.status === 0 && result.error === undefined;
  if (result.error) throw result.error;
  if (!ok) {
    const err = new Error(output.trim().split("\n").find(l => l.trim()) ?? "command failed");
    (err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stdout = result.stdout ?? "";
    (err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stderr = result.stderr ?? "";
    throw err;
  }
  return { output, ok };
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

async function waitForServer(port: number, retries = 80): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    if (await httpGet(port, "/") === 200) return true;
    await new Promise((r) => setTimeout(r, 500));
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
    const { output } = runAndCapture("pnpm", ["test"]);
    // Strip ANSI escape codes — vitest emits colour even in non-TTY CI pipes
    const clean = output.replace(/\x1b\[[0-9;]*m/g, "");
    const m = clean.match(/Tests\s+(\d+)\s+passed/);
    testCount = m ? parseInt(m[1], 10) : 0;
    pass("1. Full test suite passes", `${testCount} tests passed`);
  } catch (e: unknown) {
    fail("1. Full test suite passes", getExecErrorMessage(e));
  }

  // ── Check 2: TypeScript compiles without errors ───────────────────────────
  try {
    runAndCapture("npx", ["tsc", "--noEmit", "-p", "tsconfig.json"]);
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
    const { output: out9 } = runAndCapture("pnpm", ["demo:web:validate"]);
    const m9 = out9.match(/(\d+)\s+passed/i);
    const count = m9 ? m9[1] : "all";
    pass("9. demo:web:validate passes", `${count} assertions passed`);
  } catch (e: unknown) {
    fail("9. demo:web:validate passes", getExecErrorMessage(e));
  }

  // ── Check 10: demo:support:validate ──────────────────────────────────────
  try {
    const { output: out10 } = runAndCapture("pnpm", ["demo:support:validate"]);
    const m10 = out10.match(/(\d+)\s+passed/i);
    const count10 = m10 ? m10[1] : "all";
    pass("10. demo:support:validate passes", `${count10} assertions passed`);
  } catch (e: unknown) {
    fail("10. demo:support:validate passes", getExecErrorMessage(e));
  }

  // ── Check 11: review:validate ─────────────────────────────────────────────
  try {
    const { output: out11 } = runAndCapture("pnpm", ["review:validate"]);
    const m11 = out11.match(/(\d+)\s+passed/i);
    const count11 = m11 ? m11[1] : "all";
    pass("11. review:validate passes", `${count11} assertions passed`);
  } catch (e: unknown) {
    fail("11. review:validate passes", getExecErrorMessage(e));
  }

  // ── Check 12: Import boundary enforcement ────────────────────────────────
  try {
    runAndCapture("pnpm", ["check:imports"]);
    pass("12. No architectural import boundary violations", "all boundaries clean");
  } catch (e: unknown) {
    fail("12. No architectural import boundary violations", getExecErrorMessage(e));
  }

  // ── Check 13: Invariant coverage — all invariants have covering tests ─────
  try {
    const { output: out13 } = runAndCapture("pnpm", ["check:invariants"]);
    const m13 = out13.match(/(\d+)\s*\/\s*(\d+)\s+invariants?\s+covered/i);
    const summary = m13 ? `${m13[1]} / ${m13[2]} invariants covered` : "all invariants covered";
    pass("13. All invariants linked to covering tests", summary);
  } catch (e: unknown) {
    fail("13. All invariants linked to covering tests", getExecErrorMessage(e));
  }

  // ── Check 14: No stale test-count references in documentation ─────────────
  {
    const docsDir = join(ROOT, "docs");
    const mdPattern = /(\d+)\s*\/\s*\d+\s*tests?\s*passing/gi;
    const staleRefs: string[] = [];

    function scanMdDir(dir: string): void {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) { scanMdDir(full); continue; }
        if (!entry.name.endsWith(".md")) continue;
        const content = readFileSync(full, "utf-8");
        let m2: RegExpExecArray | null;
        mdPattern.lastIndex = 0;
        while ((m2 = mdPattern.exec(content)) !== null) {
          const n = parseInt(m2[1]!, 10);
          if (testCount > 0 && n !== testCount) {
            const rel = full.replace(ROOT + "/", "");
            staleRefs.push(`${rel}: found ${n}, actual ${testCount}`);
          }
        }
      }
    }

    scanMdDir(docsDir);

    // Also check root README
    const readmeRef = readme.match(/(\d+)\s*\/\s*\d+\s*tests?\s*passing/gi);
    if (readmeRef) {
      for (const ref of readmeRef) {
        const n = parseInt(ref.match(/(\d+)/)?.[1] ?? "0", 10);
        if (testCount > 0 && n !== testCount) {
          staleRefs.push(`README.md: found ${n}, actual ${testCount}`);
        }
      }
    }

    if (staleRefs.length === 0) {
      pass("14. No stale test-count references in documentation", "all references match actual count");
    } else {
      fail("14. No stale test-count references in documentation", staleRefs.join("; "));
    }
  }

  // ── Check 15: Pilot documents exist and contain required sections ──────────
  {
    type PilotDoc = { file: string; required: string[] };
    const pilotDocs: PilotDoc[] = [
      {
        file: "docs/pilot/pilot-readiness-brief.md",
        required: [
          "Required Client Inputs",
          "Agreement Prerequisites",
          "Pilot Scope Boundaries",
          "Support Boundary",
        ],
      },
      {
        file: "docs/pilot-operations-model.md",
        required: [
          "Issue Reporting",
          "Support Commitment",
          "Response Times",
          "Pilot Onboarding",
        ],
      },
      {
        file: "docs/pilot/pilot-intake-checklist.md",
        required: [],
      },
    ];

    const pilotFails: string[] = [];
    for (const doc of pilotDocs) {
      const full = join(ROOT, doc.file);
      if (!existsSync(full)) {
        pilotFails.push(`${doc.file} — file missing`);
        continue;
      }
      const content = readFileSync(full, "utf-8");
      if (content.trim().length === 0) {
        pilotFails.push(`${doc.file} — file is empty`);
        continue;
      }
      for (const section of doc.required) {
        if (!content.includes(section)) {
          pilotFails.push(`${doc.file} — missing section: "${section}"`);
        }
      }
    }

    if (pilotFails.length === 0) {
      pass("15. Pilot documents exist and contain required sections", `${pilotDocs.length} pilot docs verified`);
    } else {
      fail("15. Pilot documents exist and contain required sections", pilotFails.join("; "));
    }
  }

  // ── Check 16: cerbaseal.policy.json parses without error (informational) ──
  {
    const policyPath = join(ROOT, "cerbaseal.policy.json");
    if (!existsSync(policyPath)) {
      pass("16. cerbaseal.policy.json parses without error", "file not present (optional — no policy configured)");
    } else {
      try {
        const raw = readFileSync(policyPath, "utf-8");
        JSON.parse(raw);
        // Basic structural check: if actorMappings present, values must be strings.
        // If approvalChains present, values must be arrays of strings.
        // If actionPolicies present, values must be objects with valid behaviour strings.
        const obj = JSON.parse(raw) as Record<string, unknown>;
        const validBehaviours = new Set(["requires_approval", "auto_allow", "blocked"]);
        const issues: string[] = [];

        if (obj["actorMappings"] !== undefined) {
          if (typeof obj["actorMappings"] !== "object" || Array.isArray(obj["actorMappings"])) {
            issues.push("actorMappings must be an object");
          } else {
            for (const [k, v] of Object.entries(obj["actorMappings"] as Record<string, unknown>)) {
              if (k.startsWith("_")) continue;
              if (typeof v !== "string") issues.push(`actorMappings["${k}"] must be a string`);
            }
          }
        }

        if (obj["approvalChains"] !== undefined) {
          if (typeof obj["approvalChains"] !== "object" || Array.isArray(obj["approvalChains"])) {
            issues.push("approvalChains must be an object");
          } else {
            for (const [k, v] of Object.entries(obj["approvalChains"] as Record<string, unknown>)) {
              if (k.startsWith("_")) continue;
              if (!Array.isArray(v) || !(v as unknown[]).every((c) => typeof c === "string")) {
                issues.push(`approvalChains["${k}"] must be an array of strings`);
              }
            }
          }
        }

        if (obj["actionPolicies"] !== undefined) {
          if (typeof obj["actionPolicies"] !== "object" || Array.isArray(obj["actionPolicies"])) {
            issues.push("actionPolicies must be an object");
          } else {
            for (const [wf, actions] of Object.entries(obj["actionPolicies"] as Record<string, unknown>)) {
              if (wf.startsWith("_")) continue;
              if (typeof actions !== "object" || Array.isArray(actions) || actions === null) {
                issues.push(`actionPolicies["${wf}"] must be an object`);
                continue;
              }
              for (const [action, behaviour] of Object.entries(actions as Record<string, unknown>)) {
                if (!validBehaviours.has(behaviour as string)) {
                  issues.push(`actionPolicies["${wf}"]["${action}"] must be requires_approval | auto_allow | blocked`);
                }
              }
            }
          }
        }

        if (obj["workflowRules"] !== undefined) {
          if (!Array.isArray(obj["workflowRules"])) {
            issues.push("workflowRules must be an array");
          } else {
            for (const item of obj["workflowRules"] as unknown[]) {
              if (typeof item !== "object" || item === null || Array.isArray(item)) {
                issues.push("workflowRules entries must be objects");
                continue;
              }
              const entry = item as Record<string, unknown>;
              if (typeof entry["workflowClass"] !== "string" || (entry["workflowClass"] as string).trim().length === 0) {
                issues.push('workflowRules entry missing or invalid "workflowClass" string');
              }
              if (typeof entry["requiresApproval"] !== "boolean") {
                issues.push(`workflowRules["${entry["workflowClass"] ?? "?"}"].requiresApproval must be a boolean`);
              }
            }
          }
        }

        if (issues.length === 0) {
          pass("16. cerbaseal.policy.json parses without error", "policy file valid");
        } else {
          fail("16. cerbaseal.policy.json parses without error", issues.join("; "));
        }
      } catch (e: unknown) {
        fail("16. cerbaseal.policy.json parses without error", getErrorMessage(e));
      }
    }
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
