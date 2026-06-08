#!/usr/bin/env tsx
/**
 * CerbaSeal Setup Wizard
 *
 * Interactive CLI that guides a new operator through initial deployment.
 * Writes cerbaseal.config.json and cerbaseal.policy.json to the repo root,
 * then runs pnpm audit:repo to verify the configuration is correct.
 *
 * Usage:
 *   pnpm setup
 *
 * Non-interactive (pipe answers):
 *   printf "C\nTransaction Fraud Review\nfraud-ai-agent\n1\nSenior Analyst\nanalyst\n/var/log/cerbaseal.jsonl\ndev\n" | npx tsx scripts/setup.ts
 */

import { createInterface } from "node:readline";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");

const CORE_AUTHORITY_CLASSES = [
  "system", "ai", "analyst", "reviewer", "manager", "compliance_officer"
] as const;

function toSnakeCase(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

// ── Reliable stdin reader that works for both TTY and piped input ──────────────
function makeReader() {
  const pending: string[] = [];
  const waiting: Array<(s: string) => void> = [];
  let eof = false;

  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

  rl.on("line", (line) => {
    const resolve = waiting.shift();
    if (resolve) {
      resolve(line.trim());
    } else {
      pending.push(line.trim());
    }
  });

  rl.on("close", () => {
    eof = true;
    for (const resolve of waiting.splice(0)) resolve("");
  });

  async function question(prompt: string, defaultVal = ""): Promise<string> {
    const suffix = defaultVal ? ` [${defaultVal}]` : "";
    process.stdout.write(`  ${prompt}${suffix}: `);

    let answer: string;
    if (pending.length > 0) {
      answer = pending.shift()!;
      process.stdout.write(answer + "\n");
    } else if (eof) {
      answer = "";
      process.stdout.write("\n");
    } else {
      answer = await new Promise<string>((resolve) => {
        waiting.push((line) => {
          if (!process.stdin.isTTY) process.stdout.write(line + "\n");
          resolve(line);
        });
      });
    }

    return answer || defaultVal;
  }

  function close() { rl.close(); }

  return { question, close };
}

async function main(): Promise<void> {
  const reader = makeReader();

  console.log("\nCerbaSeal Setup Wizard");
  console.log("=".repeat(52));
  console.log("Guides initial deployment configuration in 6 questions.");
  console.log("Writes cerbaseal.config.json and cerbaseal.policy.json,");
  console.log("then runs pnpm audit:repo to verify everything is correct.\n");

  // ── Q1: Deployment mode ─────────────────────────────────────────────────────
  console.log("1. Deployment mode");
  console.log("   A — Lamont Labs-hosted  (Lamont Labs manages infrastructure)");
  console.log("   B — Partner-hosted       (partner manages infrastructure)");
  console.log("   C — Client-controlled    (you manage your own server)");
  const modeRaw = (await reader.question("Select deployment mode (A/B/C)", "C")).toUpperCase();
  const deploymentMode = modeRaw === "A" ? "mode_a" : modeRaw === "B" ? "mode_b" : "mode_c";
  const modeName = modeRaw === "A"
    ? "Mode A — Lamont Labs-hosted"
    : modeRaw === "B"
    ? "Mode B — Partner-hosted"
    : "Mode C — Client-controlled";
  console.log();

  // ── Q2: Workflow name ────────────────────────────────────────────────────────
  console.log("2. Primary workflow");
  const workflowName = await reader.question("Workflow name (e.g. Transaction Fraud Review)", "Unnamed Workflow");
  const workflowClass = toSnakeCase(workflowName) || "unnamed_workflow";
  console.log(`   → Workflow class: ${workflowClass}`);
  console.log();

  // ── Q3: AI actor identifier ──────────────────────────────────────────────────
  console.log("3. AI system");
  const aiActorId = await reader.question("AI actor identifier (e.g. fraud-ai-agent)", "ai-agent");
  console.log();

  // ── Q4: Approver roles ───────────────────────────────────────────────────────
  console.log("4. Human approver roles (enter 1–3)");
  console.log("   Authority classes: analyst | compliance_officer | manager | reviewer | system");
  const numApproversRaw = await reader.question("Number of approver roles", "1");
  const numApprovers = Math.min(3, Math.max(1, parseInt(numApproversRaw, 10) || 1));

  const approvers: Array<{ roleName: string; authorityClass: string }> = [];
  for (let i = 0; i < numApprovers; i++) {
    const roleName = await reader.question(`  Approver ${i + 1} role name`, "Senior Analyst");
    const rawClass = await reader.question(`  CerbaSeal authority class for "${roleName}"`, "analyst");
    const authorityClass = (CORE_AUTHORITY_CLASSES as readonly string[]).includes(rawClass) ? rawClass : "analyst";
    approvers.push({ roleName, authorityClass });
  }
  console.log();

  // ── Q5: Log storage ──────────────────────────────────────────────────────────
  console.log("5. Audit log storage");
  console.log("   Enter a file path for persistent logs, or 'memory' for in-memory (dev only).");
  const logPath = await reader.question("Audit log path or 'memory'", "/var/log/cerbaseal/audit.jsonl");
  console.log();

  // ── Q6: Environment ──────────────────────────────────────────────────────────
  console.log("6. Deployment environment");
  const environment = await reader.question("Environment (dev/staging/production)", "dev");
  console.log();

  reader.close();

  // ── Build cerbaseal.config.json ───────────────────────────────────────────────
  const extendedClasses = approvers
    .map((ap) => ap.authorityClass)
    .filter((c) => !(CORE_AUTHORITY_CLASSES as readonly string[]).includes(c));

  const configJson = {
    _comment: "CerbaSeal runtime configuration — generated by pnpm setup",
    _generatedAt: new Date().toISOString(),
    _workflowName: workflowName,
    _environment: environment,
    _deploymentMode: deploymentMode,
    authorityClasses: {
      core: [...CORE_AUTHORITY_CLASSES],
      extended: extendedClasses,
    },
    workflowClasses: {
      core: ["fraud_triage", "transaction_escalation", "account_hold_recommendation"],
      extended: [workflowClass],
    },
    actionClasses: {
      core: ["allow", "hold", "reject", "escalate", "account_hold"],
      extended: [],
    },
  };

  // ── Build cerbaseal.policy.json ───────────────────────────────────────────────
  const actorMappings: Record<string, string> = {};
  for (const ap of approvers) {
    actorMappings[ap.roleName] = ap.authorityClass;
  }

  const approverClasses = [...new Set(approvers.map((ap) => ap.authorityClass))];

  const policyJson = {
    _schema: "cerbaseal-policy/v1",
    _generatedAt: new Date().toISOString(),
    _workflowName: workflowName,
    _aiActorId: aiActorId,
    _logPath: logPath,
    actorMappings,
    approvalChains: {
      [workflowClass]: approverClasses,
    },
    actionPolicies: {
      [workflowClass]: {
        escalate: "requires_approval",
        account_hold: "requires_approval",
        allow: "auto_allow",
        hold: "auto_allow",
        reject: "auto_allow",
      },
    },
  };

  // ── Write files ───────────────────────────────────────────────────────────────
  const configPath = join(ROOT, "cerbaseal.config.json");
  const policyPath = join(ROOT, "cerbaseal.policy.json");

  writeFileSync(configPath, JSON.stringify(configJson, null, 2) + "\n", "utf-8");
  writeFileSync(policyPath, JSON.stringify(policyJson, null, 2) + "\n", "utf-8");

  console.log("=".repeat(52));
  console.log("Files written:");
  console.log(`  cerbaseal.config.json  — authority classes, workflow class: ${workflowClass}`);
  console.log(`  cerbaseal.policy.json  — actor mappings, approval chains`);
  console.log();

  // ── Print summary ─────────────────────────────────────────────────────────────
  console.log("CONFIGURATION SUMMARY");
  console.log("-".repeat(52));
  console.log(`Deployment mode  : ${modeName}`);
  console.log(`Workflow name    : ${workflowName}`);
  console.log(`Workflow class   : ${workflowClass}`);
  console.log(`AI actor         : ${aiActorId}`);
  console.log(`Approvers        : ${approvers.map((a) => `${a.roleName} → ${a.authorityClass}`).join(", ")}`);
  console.log(`Audit log        : ${logPath === "memory" ? "in-memory (development only)" : logPath}`);
  console.log(`Environment      : ${environment}`);
  console.log();

  // ── Run audit ─────────────────────────────────────────────────────────────────
  console.log("Running pnpm audit:repo to verify configuration...\n");
  try {
    execSync("pnpm audit:repo", { cwd: ROOT, stdio: "inherit" });
    console.log("\n✓ Setup complete — CerbaSeal is configured and all 16 audit checks pass.");
    console.log("\nNext steps:");
    console.log("  1. Review cerbaseal.config.json and cerbaseal.policy.json");
    console.log("  2. Run: tsx deployment-starter/verify.ts");
    console.log("  3. See: docs/deployment/quickstart-operator-guide.md");
  } catch {
    console.error("\n✗ Audit check failed. Review the output above and correct the configuration.");
    process.exit(1);
  }
}

main().catch((e: unknown) => {
  console.error("Setup error:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
