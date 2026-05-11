import type { GateResult } from "../types/core.js";

export function renderCertificate(result: GateResult): string {
  const env = result.decisionEnvelope;
  const state = env.finalState;
  const lines: string[] = [];

  lines.push("CERBASEAL CERTIFICATE OF ENFORCEMENT");
  lines.push("─".repeat(44));
  lines.push(`Decision:         ${state}`);
  lines.push(`Request ID:       ${env.requestId}`);
  lines.push(`Workflow Class:   ${env.workflowClass}`);
  lines.push(`Action Class:     ${env.permittedActionClass ?? "none"}`);
  lines.push(`Evidence Bundle:  ${env.evidenceBundleId}`);
  lines.push(`Evaluated At:     ${env.trace.evaluatedAt}`);
  lines.push("");
  lines.push("Reason Codes:");
  for (const code of env.trace.reasonCodes) {
    lines.push(`  - ${code}`);
  }
  lines.push("");

  if (state === "ALLOW" && result.releaseAuthorization !== null) {
    const ra = result.releaseAuthorization;
    lines.push(`Release Authorization: present`);
    lines.push(`  Authorization ID: ${ra.releaseAuthorizationId}`);
    lines.push(`  Action Class:     ${ra.actionClass}`);
    lines.push(`  Released At:      ${ra.releasedAt}`);
    lines.push("");
    lines.push(`Blocked Action Record: none`);
  } else {
    lines.push(`Release Authorization: none`);
    lines.push("");

    if (result.blockedActionRecord !== null) {
      lines.push(`Blocked Action Record: present`);
    } else {
      lines.push(`Blocked Action Record: none`);
    }
  }

  lines.push("");
  lines.push("Evidence Status: recorded");
  lines.push("");

  if (state === "REJECT") {
    lines.push("Interpretation:");
    lines.push("  The requested action was not authorized for execution.");
  } else if (state === "HOLD") {
    lines.push("Interpretation:");
    lines.push("  The requested action was paused because required approval was missing.");
  } else {
    lines.push("Interpretation:");
    lines.push("  The requested action was authorized for execution.");
  }

  lines.push("");
  lines.push("─".repeat(44));
  lines.push("Note: This is a readable view of system output only.");
  lines.push("It does not constitute legal or regulatory certification.");

  return lines.join("\n");
}
