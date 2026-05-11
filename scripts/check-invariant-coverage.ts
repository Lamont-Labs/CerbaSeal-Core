import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const REGISTRY_PATH = join(ROOT, "architecture", "invariants", "invariant-registry.yaml");

type InvariantRecord = {
  id: string;
  name: string;
  enforced_by: string[];
};

type CheckResult = { id: string; name: string; pass: boolean; reason: string; files: string[] };

function parseRegistry(yaml: string): InvariantRecord[] {
  const records: InvariantRecord[] = [];
  const blocks = yaml.split(/\n  - id: /);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]!;
    const idMatch = block.match(/^([^\n]+)/);
    if (!idMatch) continue;
    const id = idMatch[1]!.trim();

    const nameMatch = block.match(/\n    name:\s*([^\n]+)/);
    const name = nameMatch ? nameMatch[1]!.trim() : "(unknown)";

    const enforcedByMatch = block.match(/\n    enforced_by:\n((?:      - [^\n]+\n?)*)/);
    const enforced_by: string[] = [];
    if (enforcedByMatch) {
      const listBlock = enforcedByMatch[1]!;
      for (const line of listBlock.split("\n")) {
        const item = line.replace(/^      - /, "").trim();
        if (item.length > 0) enforced_by.push(item);
      }
    }

    records.push({ id, name, enforced_by });
  }
  return records;
}

function main(): void {
  console.log("\nCerbaSeal Invariant Coverage Check");
  console.log("=".repeat(52));

  if (!existsSync(REGISTRY_PATH)) {
    console.error("  ✗ FAIL  invariant-registry.yaml not found");
    process.exit(1);
  }

  const yaml = readFileSync(REGISTRY_PATH, "utf-8");
  const invariants = parseRegistry(yaml);

  if (invariants.length === 0) {
    console.error("  ✗ FAIL  No invariants parsed from registry");
    process.exit(1);
  }

  const results: CheckResult[] = [];

  for (const inv of invariants) {
    if (inv.enforced_by.length === 0) {
      results.push({
        id: inv.id,
        name: inv.name,
        pass: false,
        reason: "enforced_by list is empty — no covering tests declared",
        files: [],
      });
      continue;
    }

    const missing: string[] = [];
    for (const relPath of inv.enforced_by) {
      const absPath = join(ROOT, relPath);
      if (!existsSync(absPath)) {
        missing.push(relPath);
      }
    }

    if (missing.length > 0) {
      results.push({
        id: inv.id,
        name: inv.name,
        pass: false,
        reason: `declared test file(s) not found on disk: ${missing.join(", ")}`,
        files: inv.enforced_by,
      });
    } else {
      results.push({
        id: inv.id,
        name: inv.name,
        pass: true,
        reason: `${inv.enforced_by.length} covering test file(s) verified`,
        files: inv.enforced_by,
      });
    }
  }

  for (const r of results) {
    if (r.pass) {
      console.log(`  ✓ ${r.id}  ${r.name}`);
      for (const f of r.files) {
        console.log(`         ${f}`);
      }
    } else {
      console.log(`  ✗ ${r.id}  ${r.name}`);
      console.log(`         → ${r.reason}`);
    }
  }

  console.log("\n" + "=".repeat(52));
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`${passed} / ${total} invariants covered`);

  if (passed < total) {
    console.log("Status: FAIL\n");
    process.exit(1);
  } else {
    console.log("Status: PASS\n");
    process.exit(0);
  }
}

main();
