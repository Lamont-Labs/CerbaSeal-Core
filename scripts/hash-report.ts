import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , filePath] = process.argv;

if (!filePath) {
  console.error("Usage: ts-node scripts/hash-report.ts <path-to-file>");
  process.exit(1);
}

const absolutePath = resolve(filePath);
const content = readFileSync(absolutePath);
const hash = createHash("sha256").update(content).digest("hex");

console.log(`sha256:${hash}`);
