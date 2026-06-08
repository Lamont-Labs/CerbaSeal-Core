import { useState } from "react";
import { Wrench, ChevronRight, RotateCcw, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";

type Node =
  | { type: "question"; text: string; options: { label: string; next: string }[] }
  | { type: "resolution"; title: string; cause: string; steps: string[]; commands?: string[]; docs?: string; escalate?: string };

const tree: Record<string, Node> = {
  start: {
    type: "question",
    text: "What is the primary symptom?",
    options: [
      { label: "Every request is being REJECTED", next: "all_rejected" },
      { label: "Requests I expect to ALLOW are being HELD", next: "unexpected_hold" },
      { label: "Requests I expect to ALLOW are being REJECTED", next: "unexpected_reject" },
      { label: "Evidence package is not generating correctly", next: "evidence_fail" },
      { label: "Audit log is missing entries or chain verification fails", next: "audit_fail" },
      { label: "The deployment isn't starting or crashing on launch", next: "deploy_fail" },
      { label: "Something else", next: "other" },
    ],
  },
  all_rejected: {
    type: "question",
    text: "What error or reason code appears in the DecisionEnvelope trace?",
    options: [
      { label: "LOGGING_NOT_READY", next: "fix_logging" },
      { label: "NO_POLICY_PACK", next: "fix_policy" },
      { label: "NO_PROVENANCE", next: "fix_provenance" },
      { label: "TRUST_STATE_INVALID", next: "fix_trust" },
      { label: "PROHIBITED_USE", next: "fix_prohibited" },
      { label: "MALFORMED_REQUEST or UNKNOWN_ACTION_CLASS", next: "fix_schema" },
      { label: "I don't see a reason code — just crashes", next: "fix_crash" },
    ],
  },
  unexpected_hold: {
    type: "question",
    text: "Is human approval (approvalArtifact) included in the request?",
    options: [
      { label: "No — I didn't include an approval artifact", next: "fix_missing_approval" },
      { label: "Yes — I included one but it's still being held", next: "fix_invalid_approval" },
    ],
  },
  unexpected_reject: {
    type: "question",
    text: "Which reason code appears in the trace.reasonCodes array?",
    options: [
      { label: "INVALID_APPROVAL_AUTHORITY", next: "fix_approval_authority" },
      { label: "PRIVILEGED_AUTH_NOT_SATISFIED", next: "fix_privileged_auth" },
      { label: "APPROVAL_SIGNATURE_MISSING", next: "fix_signature" },
      { label: "AI_CANNOT_AUTHORIZE", next: "fix_ai_auth" },
      { label: "CONTROL_STALE_OR_INVALID", next: "fix_controls" },
      { label: "INVALID_PROPOSAL", next: "fix_proposal_mismatch" },
      { label: "Something else", next: "fix_other_reject" },
    ],
  },
  evidence_fail: {
    type: "question",
    text: "What happens when you run pnpm generate:evidence-report?",
    options: [
      { label: "Error: proof-snapshot.json not found", next: "fix_no_snapshot" },
      { label: "Error: manifestChecksum invalid", next: "fix_checksum" },
      { label: "Report generates but is missing sections", next: "fix_incomplete_report" },
      { label: "No error but no output files appear", next: "fix_no_output" },
    ],
  },
  audit_fail: {
    type: "question",
    text: "What does pnpm audit:repo show for audit-related checks?",
    options: [
      { label: "Chain verification failed — hashes don't match", next: "fix_chain_tamper" },
      { label: "Log file not found", next: "fix_log_missing" },
      { label: "Entries are out of order", next: "fix_log_order" },
      { label: "Everything passes but log is empty", next: "fix_empty_log" },
    ],
  },
  deploy_fail: {
    type: "question",
    text: "When does the failure occur?",
    options: [
      { label: "Immediately on startup — PORT or BASE_PATH error", next: "fix_port" },
      { label: "TypeScript compile errors", next: "fix_ts" },
      { label: "Import errors — module not found", next: "fix_imports" },
      { label: "Crashes after a few seconds", next: "fix_runtime_crash" },
    ],
  },

  // ── Resolutions ──
  fix_logging: {
    type: "resolution",
    title: "loggingReady must be true on every request",
    cause: "INV-04: The gate rejects any request where loggingReady is false. This is a fail-closed guard — no action is released without an active audit trail.",
    steps: [
      "Check your GovernedRequest object — loggingReady must be set to true",
      "Ensure your AppendOnlyLogService or FileBackedAppendOnlyLogService is initialised before you call evaluate()",
      "For file-backed logs: verify the log file path is writable by the process user",
      "For development: use AppendOnlyLogService (in-memory). For production: use FileBackedAppendOnlyLogService",
    ],
    commands: [
      "// Correct: loggingReady must be true",
      'const request = { ..., loggingReady: true };',
      "",
      "// Check log service initialises without error:",
      'const log = new FileBackedAppendOnlyLogService("./audit/decisions.jsonl");',
    ],
    docs: "src/services/audit/append-only-log-service.ts",
  },
  fix_policy: {
    type: "resolution",
    title: "policyPackRef is null — INV-01",
    cause: "Every request must carry a non-null policyPackRef. Without it the gate has no basis for permitting any action.",
    steps: [
      "Add a policyPackRef to your GovernedRequest",
      "policyPackRef must have at least an id and version field",
      "This reference is logged in the audit trail for traceability",
    ],
    commands: [
      "// Correct:",
      "const request = {",
      "  ...,",
      '  policyPackRef: { id: "policy-v1", version: "1.0.0" },',
      "};",
    ],
    docs: "src/domain/types/core.ts",
  },
  fix_provenance: {
    type: "resolution",
    title: "provenanceRef is null or has empty fields — INV-02",
    cause: "Full provenance (modelVersion, ruleSetVersion, sourceHash) is required. Any of these being an empty string is treated as missing.",
    steps: [
      "Set provenanceRef to a non-null object",
      "Ensure modelVersion, ruleSetVersion, and sourceHash are all non-empty strings",
      "Empty string ('') is treated the same as null — it will trigger REJECT",
    ],
    commands: [
      "const request = {",
      "  ...,",
      "  provenanceRef: {",
      '    modelVersion: "gpt-4-0125-preview",',
      '    ruleSetVersion: "rules-v2.1",',
      '    sourceHash: "sha256:abc123...",',
      "  },",
      "};",
    ],
    docs: "src/domain/types/core.ts",
  },
  fix_trust: {
    type: "resolution",
    title: "trustState.trusted is false — INV-09",
    cause: "The gate rejects any request where trustState.trusted is false. This check runs before approval state — it cannot be overridden with an approval artifact.",
    steps: [
      "Check your trustState object — trusted must be set to true",
      "If the actor is genuinely untrusted, the REJECT is correct — review why the actor is not trusted",
      "In development/testing, always set trusted: true unless you are specifically testing INV-09",
    ],
    commands: ['const request = { ..., trustState: { trusted: true } };'],
  },
  fix_prohibited: {
    type: "resolution",
    title: "prohibitedUse is true — INV-10",
    cause: "The gate rejects unconditionally when prohibitedUse is true. This check runs before approval state and cannot be overridden.",
    steps: [
      "Set prohibitedUse: false if the use is not genuinely prohibited",
      "If prohibitedUse is set dynamically (e.g. based on jurisdiction), check the logic that sets it",
      "This flag is for sanctioned jurisdictions, restricted action types, or policy exclusions",
    ],
    commands: ['const request = { ..., prohibitedUse: false };'],
  },
  fix_schema: {
    type: "resolution",
    title: "Request shape validation failure — INV-11",
    cause: "MALFORMED_REQUEST or UNKNOWN_ACTION_CLASS means one of: empty requestId/jurisdiction/createdAt, empty proposal.reasonCodes[], unknown proposedActionClass, or unknown actorAuthorityClass.",
    steps: [
      "Check requestId is a non-empty string",
      "Check jurisdiction is a non-empty string",
      "Check createdAt is a valid ISO 8601 timestamp",
      "Check proposal.reasonCodes is a non-empty array",
      "Check proposedActionClass is one of: allow | hold | reject | escalate | account_hold",
      "Check actorAuthorityClass is in your cerbaseal.config.json allowedAuthorityClasses",
      "Run pnpm check:invariants to verify your test coverage of INV-11",
    ],
    commands: [
      "// Valid actorAuthorityClass values (core):",
      "// system | ai | analyst | reviewer | manager | compliance_officer",
      "// Extended classes: add to cerbaseal.config.json extended[] array",
      "",
      "// Valid proposedActionClass values:",
      "// allow | hold | reject | escalate | account_hold",
    ],
    docs: "cerbaseal.config.json",
  },
  fix_missing_approval: {
    type: "resolution",
    title: "Approval required but approvalArtifact is null — produces HOLD",
    cause: "When approval is required (either by approvalRequired: true on the request, or because the workflow class always requires approval like fraud_triage), the gate produces HOLD until a valid ApprovalArtifact is provided.",
    steps: [
      "Step 1: Receive the HOLD result — this is correct behaviour",
      "Step 2: Have a human approver construct an ApprovalArtifact",
      "Step 3: Set forRequestId to the original request's requestId",
      "Step 4: Set approvedAt to a timestamp >= request.createdAt",
      "Step 5: Resubmit the request with the approvalArtifact included",
      "Note: fraud_triage workflow always requires approval regardless of approvalRequired flag",
    ],
    commands: [
      "const artifact = {",
      '  approvalId: "approval-' + Date.now() + '",',
      "  approverId: \"reviewer-123\",",
      "  forRequestId: originalRequest.requestId,  // critical — must match",
      '  approverAuthorityClass: "reviewer",',
      "  privilegedAuthSatisfied: true,",
      '  immutableSignature: "sig-abc123...",',
      "  approvedAt: new Date().toISOString(),      // must be >= createdAt",
      "};",
    ],
    docs: "src/domain/types/core.ts",
  },
  fix_invalid_approval: {
    type: "resolution",
    title: "ApprovalArtifact present but invalid — produces REJECT",
    cause: "Five validation checks run on every ApprovalArtifact. Any failure produces REJECT.",
    steps: [
      "Check 1: artifact.forRequestId must equal request.requestId exactly",
      "Check 2: artifact.approvedAt must be >= request.createdAt (earlier timestamp = forged)",
      "Check 3: artifact.approverAuthorityClass must be analyst | reviewer | manager | compliance_officer",
      "Check 4: artifact.privilegedAuthSatisfied must be true",
      "Check 5: artifact.immutableSignature must be a non-empty string",
      "Check the reason code in the trace for which check failed (INVALID_APPROVAL_AUTHORITY, PRIVILEGED_AUTH_NOT_SATISFIED, or APPROVAL_SIGNATURE_MISSING)",
    ],
  },
  fix_approval_authority: {
    type: "resolution",
    title: "INVALID_APPROVAL_AUTHORITY — artifact binding or timestamp failure",
    cause: "The approval artifact's forRequestId doesn't match the request's requestId, OR the approvedAt timestamp is earlier than request.createdAt.",
    steps: [
      "Verify artifact.forRequestId === request.requestId character-for-character",
      "Verify artifact.approvedAt is >= request.createdAt as an ISO timestamp",
      "Verify artifact.approverAuthorityClass is a valid HumanAuthorityClass",
      "If approving a re-submitted request, use the original requestId — not a new one",
    ],
  },
  fix_privileged_auth: {
    type: "resolution",
    title: "PRIVILEGED_AUTH_NOT_SATISFIED",
    cause: "The approver's privilegedAuthSatisfied field is false on the artifact.",
    steps: [
      "Set artifact.privilegedAuthSatisfied to true",
      "This field represents that the approver completed privileged authentication (e.g. MFA, hardware key) before approving",
      "In production: your auth system should set this based on the approver's session authentication level",
      "In development/testing: always set to true unless testing this specific failure case",
    ],
    commands: ['const artifact = { ..., privilegedAuthSatisfied: true };'],
  },
  fix_signature: {
    type: "resolution",
    title: "APPROVAL_SIGNATURE_MISSING",
    cause: "artifact.immutableSignature is an empty string.",
    steps: [
      "Set artifact.immutableSignature to a non-empty string",
      "In production: this should be a cryptographic signature of the approval content",
      "In testing: any non-empty string is accepted (e.g. 'test-sig-' + Date.now())",
    ],
    commands: ["const artifact = { ..., immutableSignature: `sig-${Date.now()}` };"],
  },
  fix_ai_auth: {
    type: "resolution",
    title: "AI_CANNOT_AUTHORIZE — INV-05",
    cause: "AI actors cannot authorize actions. This triggers on two conditions: (A) proposal.authorityBearing is true regardless of actor class, or (B) actorAuthorityClass is 'ai' AND proposal.proposalSourceKind is 'ai'.",
    steps: [
      "Never set proposal.authorityBearing to true — this triggers regardless of actor type",
      "If the actor is an AI agent, the correct pattern is: AI proposes → system actor submits the request",
      "The actorAuthorityClass should be 'system' when submitting an AI's proposal",
      "The proposalSourceKind can remain 'ai' to accurately record where the proposal came from",
      "See examples/agent-integration-starter/ for the correct pattern",
    ],
    commands: [
      "// WRONG: AI actor submitting its own proposal",
      "const request = { actorAuthorityClass: 'ai', proposal: { proposalSourceKind: 'ai' } };",
      "",
      "// CORRECT: System actor carrying the AI proposal",
      "const request = { actorAuthorityClass: 'system', proposal: { proposalSourceKind: 'ai' } };",
    ],
    docs: "examples/agent-integration-starter/index.ts",
  },
  fix_controls: {
    type: "resolution",
    title: "CONTROL_STALE_OR_INVALID — INV-08",
    cause: "For sensitive requests, controlStatus.stale must be false AND criticalControlsValid must be true.",
    steps: [
      "If request.sensitive is false, this check is skipped — verify the sensitive flag is set correctly",
      "Ensure controlStatus.stale is false — stale controls indicate time-sensitive checks have expired",
      "Ensure controlStatus.criticalControlsValid is true — all critical compliance checks must be passing",
      "In testing: set sensitive: false unless you are specifically testing control status validation",
    ],
    commands: [
      "const request = {",
      "  ...,",
      "  sensitive: true,",
      "  controlStatus: {",
      "    criticalControlsValid: true,",
      "    stale: false,",
      "  },",
      "};",
    ],
  },
  fix_proposal_mismatch: {
    type: "resolution",
    title: "INVALID_PROPOSAL — action class mismatch (INV-12)",
    cause: "request.proposedActionClass must be identical to request.proposal.requestedActionClass. These two fields must match exactly.",
    steps: [
      "Check request.proposedActionClass and request.proposal.requestedActionClass are the same value",
      "This is a deliberate cross-check — the request-level action class and the proposal-level action class must agree",
      "A mismatch can indicate an action-class confusion attempt — check how both fields are being set",
    ],
    commands: [
      "// Both must be identical:",
      "const request = {",
      '  proposedActionClass: "allow",',
      "  proposal: {",
      '    requestedActionClass: "allow",  // must match proposedActionClass',
      "  },",
      "};",
    ],
  },
  fix_no_snapshot: {
    type: "resolution",
    title: "proof-snapshot.json not found",
    cause: "pnpm generate:evidence-report requires proof-snapshot.json to exist in docs/reports/. It must be generated first.",
    steps: [
      "Run pnpm export:proof to generate the proof snapshot",
      "Confirm docs/reports/proof-snapshot.json was created",
      "Then run pnpm generate:evidence-report",
    ],
    commands: [
      "pnpm export:proof              # generates docs/reports/proof-snapshot.json",
      "pnpm generate:evidence-report  # reads snapshot, writes evidence-package/",
    ],
    docs: "scripts/export-proof.ts",
  },
  fix_checksum: {
    type: "resolution",
    title: "manifestChecksum invalid — proof snapshot has been modified",
    cause: "The proof-snapshot.json file has been modified after generation. The SHA-256 manifestChecksum no longer matches the file contents.",
    steps: [
      "Do not edit proof-snapshot.json manually — it is a cryptographic proof artifact",
      "Regenerate the snapshot: pnpm export:proof",
      "Verify immediately: pnpm verify:proof",
    ],
    commands: [
      "pnpm export:proof   # regenerate",
      "pnpm verify:proof   # verify immediately after",
    ],
    escalate: "If the checksum failed without you editing the file, this could indicate a filesystem issue or a process writing to the file. Escalate to jesse@lamontlabs.io with the full error output.",
  },
  fix_chain_tamper: {
    type: "resolution",
    title: "Audit chain hash verification failed",
    cause: "An entry's stored entryHash no longer matches the recomputed hash. This indicates tampering, deletion, or reordering of log entries.",
    steps: [
      "Do not edit the JSONL log file manually",
      "If log entries were deleted to save space, the chain is now broken — start a new log file",
      "Run log.verifyChain() to get the specific entry index where the break occurs",
      "For development: it is safe to delete the log file and start fresh",
      "For production: preserve the broken log as evidence and contact support",
    ],
    escalate: "If this happened in a production environment without manual editing, escalate immediately to jesse@lamontlabs.io — include the full log file.",
  },
  fix_port: {
    type: "resolution",
    title: "PORT or BASE_PATH environment variable missing",
    cause: "The Vite development server and the browser demo server both require PORT and BASE_PATH to be set.",
    steps: [
      "Set the PORT environment variable to an available port (e.g. 3000)",
      "Set BASE_PATH to the base URL path (e.g. / for root, or /cerbaseal for a sub-path)",
      "In development: these are typically set in .env or by the workflow runner",
      "In the Replit environment: the workflow runner sets PORT automatically",
    ],
    commands: [
      "PORT=3000 BASE_PATH=/ pnpm --filter @workspace/cerbaseal-demo run dev",
    ],
  },
  fix_ts: {
    type: "resolution",
    title: "TypeScript compile errors",
    cause: "Type errors in source or configuration files.",
    steps: [
      "Run pnpm typecheck to see all errors",
      "Run pnpm audit:repo — check 2 (TypeScript compiles without errors) — this lists all type errors",
      "Common causes: missing type imports, incorrect field types on GovernedRequest, changed API signatures",
    ],
    commands: ["pnpm typecheck  # lists all type errors"],
  },
  fix_imports: {
    type: "resolution",
    title: "Module not found / import errors",
    cause: "Import path resolution failure. Often caused by ESM import extensions or path alias issues.",
    steps: [
      "CerbaSeal uses ESM modules — all imports from src/ require .js extension in import statements",
      "Check pnpm check:imports — this verifies all import boundary rules",
      "Ensure node_modules is installed: pnpm install",
    ],
    commands: [
      "pnpm install",
      "pnpm check:imports",
    ],
  },
  fix_runtime_crash: {
    type: "resolution",
    title: "Runtime crash after startup",
    cause: "Unexpected error during operation — usually a configuration or integration issue.",
    steps: [
      "Run pnpm audit:repo and read the output carefully — it tests all routes",
      "Run pnpm demo:web:validate — if this passes, the core is working",
      "Check the Node.js process output for stack traces",
      "Common cause: FileBackedAppendOnlyLogService log path is not writable",
    ],
    commands: [
      "pnpm audit:repo",
      "pnpm demo:web:validate",
    ],
  },
  fix_log_missing: { type: "resolution", title: "Log file not found", cause: "FileBackedAppendOnlyLogService was configured with a path that doesn't exist or isn't writable.", steps: ["Verify the log directory exists and is writable", "The service creates the file if it doesn't exist, but the parent directory must exist"], commands: ["mkdir -p ./audit  # create the audit directory first"] },
  fix_log_order: { type: "resolution", title: "Log entries out of order", cause: "Log entries must be appended in order. Concurrent writes or manual editing can break ordering.", steps: ["Do not write to the log file from multiple processes simultaneously", "Do not edit the log file manually", "For multi-process setups, use separate log files per process"] },
  fix_empty_log: { type: "resolution", title: "Audit log is empty", cause: "Requests may not be going through EvidenceBundleService.createBundle() after evaluate().", steps: ["createBundle() is what writes audit events — verify it is called after every evaluate()", "Check the requestId passed to createBundle matches the one in the GateResult"], docs: "src/services/evidence/evidence-bundle-service.ts" },
  fix_incomplete_report: { type: "resolution", title: "Evidence report is missing sections", cause: "The proof-snapshot.json may not contain all expected fields, or the report generator version is mismatched.", steps: ["Delete docs/reports/proof-snapshot.json", "Run pnpm export:proof to regenerate", "Run pnpm generate:evidence-report again"] },
  fix_no_output: { type: "resolution", title: "No output files from evidence generator", cause: "The evidence-package/ directory may not be getting created, or there is a silent error.", steps: ["Check the console output carefully for any warnings", "Ensure proof-snapshot.json exists: ls docs/reports/", "Run pnpm audit:repo — if all 15 checks pass the generator should work"] },
  fix_crash: { type: "resolution", title: "Crashes without a reason code", cause: "An unexpected (non-CerbaSealError) exception occurred inside evaluate(). The fail-closed catch block should produce a REJECT with MALFORMED_REQUEST, but if it can't even read the request, it re-throws.", steps: ["Check that the GovernedRequest object passed to evaluate() is a valid JavaScript object", "Verify it is not null or undefined", "Check for circular references in the request object", "Run pnpm test to confirm the test suite still passes"] },
  fix_other_reject: { type: "resolution", title: "Unexpected REJECT", cause: "Check the trace.reasonCodes array in the DecisionEnvelope for the specific trigger.", steps: ["Log the full DecisionEnvelope to console to see all fields", "The trace.reasonCodes[0] is the trigger code — look it up in Section 4 of the system PDF", "The last code (DECISION_REJECTED) is the terminal code — the trigger is the one before it"], docs: "cerbaseal-system-breakdown.pdf Section 4" },
  other: { type: "resolution", title: "Issue not covered above", cause: "Your issue doesn't match the common patterns in this troubleshooter.", steps: ["Run pnpm audit:repo — review every check that fails for clues", "Run pnpm test — check for any failing tests", "Check the full DecisionEnvelope output for all trace fields"], escalate: "If you've exhausted the above: email jesse@lamontlabs.io with (1) the full DecisionEnvelope, (2) pnpm audit:repo output, (3) pnpm test output, and (4) a description of what you expected to happen." },
};

export default function Troubleshooter() {
  const [path, setPath] = useState<string[]>(["start"]);

  const current = path[path.length - 1];
  const node = tree[current];

  function reset() {
    setPath(["start"]);
  }

  function go(next: string) {
    setPath((p) => [...p, next]);
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PageMeta
        title="Troubleshooter"
        description="Guided diagnostic for CerbaSeal deployment and runtime issues. Walk through a decision tree to identify the probable cause and resolution path — before contacting support."
        path="/troubleshoot"
      />
      <div className="flex items-center gap-3 mb-2">
        <Wrench className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Troubleshooter</h1>
      </div>
      <p className="text-slate-400 mb-8 text-sm">Identify the probable cause and resolution path — before contacting support.</p>

      {/* Breadcrumb */}
      {path.length > 1 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          {path.slice(0, -1).map((id, i) => (
            <span key={id} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <button onClick={() => setPath(path.slice(0, i + 1))} className="hover:text-slate-300 transition-colors">
                {id === "start" ? "Start" : tree[id]?.type === "question" ? (tree[id] as any).text.slice(0, 30) + "…" : id}
              </button>
            </span>
          ))}
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">{node?.type === "resolution" ? (node as any).title : "..."}</span>
        </div>
      )}

      {node?.type === "question" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-white font-medium text-lg mb-5">{node.text}</p>
          <div className="space-y-2">
            {node.options.map((opt) => (
              <button key={opt.next} onClick={() => go(opt.next)}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-amber-600 hover:text-white text-sm transition-all flex items-center justify-between group">
                {opt.label}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {node?.type === "resolution" && (() => {
        const r = node;
        return (
          <div>
            <div className="bg-amber-950 border border-amber-800 rounded-xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-white font-bold text-lg">{r.title}</h2>
              </div>
              <p className="text-slate-300 text-sm">{r.cause}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
              <div className="text-slate-400 text-xs font-bold mb-3 tracking-wide">RESOLUTION STEPS</div>
              {r.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <span className="text-slate-300 text-sm">{step}</span>
                </div>
              ))}
            </div>

            {r.commands && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
                <div className="text-slate-400 text-xs font-bold mb-2 tracking-wide">COMMANDS / CODE</div>
                <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap">{r.commands.join("\n")}</pre>
              </div>
            )}

            {r.docs && (
              <div className="flex items-center gap-2 text-blue-400 text-sm mb-4">
                <ExternalLink className="w-4 h-4" />
                <span>Reference: <code className="font-mono">{r.docs}</code></span>
              </div>
            )}

            {r.escalate && (
              <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-4">
                <div className="text-red-400 text-xs font-bold mb-1 tracking-wide">ESCALATION PATH</div>
                <p className="text-slate-300 text-sm">{r.escalate}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-6">
              <CheckCircle className="w-4 h-4" />
              Resolved? Use the Pilot Generator or continue with deployment.
            </div>
          </div>
        );
      })()}

      <Button onClick={reset} variant="outline" className="w-full border-slate-700 text-slate-300">
        <RotateCcw className="w-4 h-4 mr-2" /> Start Over
      </Button>
    </main>
  );
}
