import { getRejectScenario, getHoldScenario, getAllowScenario } from "../../src/domain/builders/gate-scenarios.js";
import { renderCertificate } from "./render-certificate.js";

let failed = false;

function check(label: string, cert: string, contains: string) {
  const pass = cert.includes(contains);
  if (!pass) failed = true;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}: contains "${contains}"`);
}

console.log("\nCerbaSeal auditor view — validation\n");

console.log("REJECT certificate (x3):");
for (let i = 1; i <= 3; i++) {
  const cert = renderCertificate(getRejectScenario());
  check(`call ${i} — Decision`, cert, "Decision:         REJECT");
  check(`call ${i} — Blocked`, cert, "Blocked Action Record: present");
  check(`call ${i} — No Release`, cert, "Release Authorization: none");
  check(`call ${i} — Interpretation`, cert, "not authorized for execution");
}

console.log("\nHOLD certificate (x3):");
for (let i = 1; i <= 3; i++) {
  const cert = renderCertificate(getHoldScenario());
  check(`call ${i} — Decision`, cert, "Decision:         HOLD");
  check(`call ${i} — Blocked`, cert, "Blocked Action Record: present");
  check(`call ${i} — No Release`, cert, "Release Authorization: none");
  check(`call ${i} — Interpretation`, cert, "approval was missing");
}

console.log("\nALLOW certificate (x3):");
for (let i = 1; i <= 3; i++) {
  const cert = renderCertificate(getAllowScenario());
  check(`call ${i} — Decision`, cert, "Decision:         ALLOW");
  check(`call ${i} — Release`, cert, "Release Authorization: present");
  check(`call ${i} — No Blocked`, cert, "Blocked Action Record: none");
  check(`call ${i} — Interpretation`, cert, "authorized for execution");
}

console.log(failed ? "\n[FAIL] One or more checks failed.\n" : "\n[PASS] All auditor view validation checks passed.\n");
process.exit(failed ? 1 : 0);
