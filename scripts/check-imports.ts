import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(join(fileURLToPath(import.meta.url), "..", ".."));

function walkTs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      out.push(...walkTs(full));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

function getZone(absPath: string): string {
  const rel = relative(ROOT, absPath).replace(/\\/g, "/");
  if (rel.startsWith("src/")) return "src";
  if (rel.startsWith("test/")) return "test";
  if (rel.startsWith("scripts/")) return "scripts";
  if (rel.startsWith("examples/")) {
    const parts = rel.split("/");
    if (parts.length >= 2 && parts[1] !== undefined) return `examples/${parts[1]}`;
  }
  return "other";
}

/**
 * Boundary rules enforced:
 *   1. src/ must not import from examples/, test/, or scripts/
 *   2. scripts/ must not import from test/
 *   3. examples/X/ must not import from examples/Y/ (cross-example dependency)
 *
 * Note: test/ importing from examples/ is permitted — integration tests
 * legitimately exercise examples as their subject under test.
 */
function isViolation(fromZone: string, toZone: string): boolean {
  if (fromZone === "src") {
    return (
      toZone.startsWith("examples/") ||
      toZone === "test" ||
      toZone === "scripts"
    );
  }
  if (fromZone === "scripts") {
    return toZone === "test";
  }
  if (fromZone.startsWith("examples/") && toZone.startsWith("examples/")) {
    return fromZone !== toZone;
  }
  return false;
}

function extractImports(source: string): string[] {
  const out: string[] = [];
  const re = /(?:^|\n)\s*(?:import|export)\s[^'"]*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    if (m[1] !== undefined) out.push(m[1]);
  }
  return out;
}

function resolveImport(importPath: string, fromFile: string): string | null {
  if (!importPath.startsWith(".")) return null;
  const normalized = importPath.replace(/\.js$/, ".ts");
  return resolve(dirname(fromFile), normalized);
}

type Violation = {
  file: string;
  importPath: string;
  fromZone: string;
  toZone: string;
};

function run(): void {
  const dirs = ["src", "test", "examples", "scripts"];
  const files = dirs.flatMap((d) => walkTs(join(ROOT, d)));

  const violations: Violation[] = [];

  for (const file of files) {
    const source = readFileSync(file, "utf-8");
    const imports = extractImports(source);
    const fromZone = getZone(file);

    for (const imp of imports) {
      const resolved = resolveImport(imp, file);
      if (resolved === null) continue;

      const toZone = getZone(resolved);
      if (toZone === "other") continue;

      if (isViolation(fromZone, toZone)) {
        violations.push({
          file: relative(ROOT, file),
          importPath: imp,
          fromZone,
          toZone,
        });
      }
    }
  }

  console.log("\nCerbaSeal Import Boundary Check");
  console.log("=".repeat(48));

  if (violations.length === 0) {
    console.log("  ✓ No boundary violations found");
    console.log(`  Scanned ${files.length} files across: ${dirs.join(", ")}`);
    console.log("\nStatus: PASS\n");
    process.exit(0);
  } else {
    console.log(`  ✗ ${violations.length} boundary violation(s) found:\n`);
    for (const v of violations) {
      console.log(`  VIOLATION in ${v.file}`);
      console.log(`    import "${v.importPath}"`);
      console.log(
        `    from zone "${v.fromZone}" → to zone "${v.toZone}" (forbidden)\n`
      );
    }
    console.log("\nStatus: FAIL\n");
    process.exit(1);
  }
}

run();
