import { useState } from "react";
import { BookOpen, CheckCircle, Clock, Users, Code, Settings, Play } from "lucide-react";

type Module = { id: string; title: string; duration: string; objectives: string[]; topics: string[]; badge?: string };
type Track = { id: string; title: string; audience: string; icon: typeof BookOpen; color: string; bg: string; border: string; totalTime: string; modules: Module[] };

const tracks: Track[] = [
  {
    id: "executive",
    title: "Executive Overview",
    audience: "Decision makers, sponsors, procurement",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-950",
    border: "border-blue-800",
    totalTime: "10 min",
    modules: [
      {
        id: "exec-1",
        title: "What CerbaSeal Is",
        duration: "3 min",
        objectives: ["Understand what CerbaSeal does in one sentence", "Understand what problem it solves", "Understand why enforcement is different from documentation"],
        topics: [
          "AI systems propose. CerbaSeal decides whether those proposals execute.",
          "The gate sits between AI intent and consequential action — payments, holds, escalations",
          "Enforcement is not advisory. ALLOW releases an action. HOLD waits. REJECT blocks permanently.",
          "Every decision produces a cryptographically chained audit trail — not a log, a proof chain",
        ],
      },
      {
        id: "exec-2",
        title: "What CerbaSeal Is Not",
        duration: "2 min",
        objectives: ["Understand the boundaries — what CerbaSeal does not claim to do", "Understand why boundaries matter commercially"],
        topics: [
          "Not a compliance certification — it supports evidence for AI Act, SOC 2, and audit purposes but is not a replacement for legal assessment",
          "Not a monitoring tool — it makes enforcement decisions, not recommendations",
          "Not a full GRC platform — it is a runtime enforcement gate, not a documentation system",
          "Not a magic AI blocker — it governs workflows you define and configure",
        ],
      },
      {
        id: "exec-3",
        title: "The Pilot Model",
        duration: "3 min",
        objectives: ["Understand what a pilot engagement includes", "Understand the commercial structure"],
        topics: [
          "A pilot is not a software purchase — it is a consulting engagement enabled by CerbaSeal",
          "Tier 2 Controlled Workflow Pilot: €35,000–€75,000, preferred anchor €45,000–€60,000",
          "Pilot includes: workflow mapping, deployment, training, evidence generation, support window",
          "After a successful pilot: annual license for ongoing enforcement layer access",
          "Pilot can cost more than Year 1 annual license — this is normal in enterprise software",
        ],
      },
      {
        id: "exec-4",
        title: "Regulatory Alignment",
        duration: "2 min",
        objectives: ["Understand how CerbaSeal maps to regulatory requirements", "Know what to communicate to compliance and legal teams"],
        topics: [
          "EU AI Act Article 14: human oversight must prevent or minimize risks — CerbaSeal enforces this at the gate",
          "Logging for traceability: CerbaSeal's audit chain satisfies traceability requirements for high-risk AI systems",
          "NIS2 supply chain scrutiny: CerbaSeal produces verifiable governance evidence for vendor review",
          "Evidence output: governance summary, decision log, audit chain verification — all automated",
          "Important: CerbaSeal supports compliance evidence — it is not a compliance certification",
        ],
      },
    ],
  },
  {
    id: "operator",
    title: "Operator Training",
    audience: "Compliance officers, reviewers, approvers, analysts",
    icon: Settings,
    color: "text-emerald-400",
    bg: "bg-emerald-950",
    border: "border-emerald-800",
    totalTime: "30 min",
    modules: [
      {
        id: "op-1",
        title: "Understanding Gate Decisions",
        duration: "8 min",
        objectives: ["Know what ALLOW, HOLD, and REJECT mean operationally", "Know what triggers each state", "Know what your responsibility is for each state"],
        topics: [
          "ALLOW: all invariants passed, action released via ReleaseAuthorization. No human action needed.",
          "HOLD: approval is required but not yet provided. A human approver must provide an ApprovalArtifact.",
          "REJECT: an invariant violation or prohibited condition. Action is permanently blocked for this request.",
          "You cannot override a REJECT by providing approval — REJECTs are terminal",
          "You can trigger a new ALLOW by submitting a corrected request (new requestId) with valid approval",
        ],
      },
      {
        id: "op-2",
        title: "Approving a HOLD Decision",
        duration: "8 min",
        objectives: ["Know how to construct a valid ApprovalArtifact", "Know all five validation rules for approval artifacts", "Know how to resubmit after approval"],
        topics: [
          "Step 1: Receive the HOLD — note the requestId",
          "Step 2: Review the request details — confirm it is appropriate to approve",
          "Step 3: Construct ApprovalArtifact with forRequestId = original requestId",
          "Step 4: Set approvedAt to now (must be >= request.createdAt — earlier timestamps are rejected as forged)",
          "Step 5: Set your approverAuthorityClass — must be analyst, reviewer, manager, or compliance_officer",
          "Step 6: Set privilegedAuthSatisfied: true — confirms you used privileged authentication",
          "Step 7: Set immutableSignature to your signature string (non-empty)",
          "Step 8: Resubmit the original request with the artifact attached",
        ],
      },
      {
        id: "op-3",
        title: "Reading the Evidence Bundle",
        duration: "7 min",
        objectives: ["Understand what an EvidenceBundle contains", "Know how to verify the audit chain", "Know how to generate and read the evidence package"],
        topics: [
          "EvidenceBundle: request + envelope + release authorization (or blocked record) + event chain",
          "eventChain: every audit event for this request in order, with SHA-256 hash links",
          "verifyChain(): run any time to confirm no entries have been tampered with or deleted",
          "pnpm export:proof → generates cryptographic proof snapshot with manifest checksum",
          "pnpm generate:evidence-report → produces 3-file evidence package from the snapshot",
          "Evidence files: governance-summary.md · decision-summary.json · audit-integrity-summary.md",
        ],
      },
      {
        id: "op-4",
        title: "Running the Demo & Validation Scripts",
        duration: "7 min",
        objectives: ["Know which scripts to run and when", "Know what a passing validation looks like", "Know what to do if validation fails"],
        topics: [
          "pnpm demo:web — start the browser review portal (routes: /review, /pilot, /security, /deployment)",
          "pnpm demo:web:validate — validate all 9 HTTP routes respond correctly",
          "pnpm demo:support:validate — run 13 support readiness assertions",
          "pnpm review:validate — run 110 review portal assertions",
          "pnpm audit:repo — run all 15 repo audit checks — should all pass before presenting evidence",
          "If any check fails: read the output carefully, use the Troubleshooter at /troubleshoot",
        ],
      },
    ],
  },
  {
    id: "admin",
    title: "Admin Training",
    audience: "Technical leads, deployment owners, system administrators",
    icon: Settings,
    color: "text-amber-400",
    bg: "bg-amber-950",
    border: "border-amber-800",
    totalTime: "30 min",
    modules: [
      {
        id: "adm-1",
        title: "Configuration — cerbaseal.config.json",
        duration: "8 min",
        objectives: ["Know how to add custom authority classes without code changes", "Know how to add custom workflow and action classes", "Know how to verify configuration is loaded correctly"],
        topics: [
          "cerbaseal.config.json has two sections per class type: core[] and extended[]",
          "Core classes are built in and cannot be removed — extended[] adds client-specific classes",
          "Adding a new authority class: add it to authorityClasses.extended[] — no TypeScript required",
          "Adding a new workflow: add it to workflowClasses.extended[]",
          "Changes take effect on next ExecutionGateService instantiation — restart the process",
          "loadCerbaSealConfig() reads this file at startup — buildAllowedAuthorityClasses() merges core + extended",
          "Verify: check actorAuthorityClass validation in pnpm test — should not produce UNKNOWN_ACTION_CLASS",
        ],
      },
      {
        id: "adm-2",
        title: "Deployment Configuration",
        duration: "7 min",
        objectives: ["Know all required environment variables", "Know how to configure persistent audit logging", "Know how to verify the deployment is healthy"],
        topics: [
          "Required: PORT (server port), BASE_PATH (URL base, e.g. /cerbaseal)",
          "Audit log: FileBackedAppendOnlyLogService('./audit/decisions.jsonl') — directory must exist and be writable",
          "Health check: GET /health via the REST API starter — checks logging, controls, chain integrity",
          "Startup check: run pnpm audit:repo before opening to traffic — 15 checks must all pass",
          "Proof export: run pnpm export:proof after each significant decision batch for archival",
        ],
      },
      {
        id: "adm-3",
        title: "Health Checks & Monitoring",
        duration: "8 min",
        objectives: ["Know which metrics to monitor", "Know what a healthy system looks like", "Know what to do on each failure mode"],
        topics: [
          "SystemHealthService: checks loggingReady, controlStatus, trustState, chain integrity",
          "GET /health (rest-api-starter): returns {status: 'healthy' | 'degraded' | 'critical'}",
          "Chain integrity: log.verifyChain() — should return true on every check",
          "Decision volume: monitor ALLOW/HOLD/REJECT ratios — unusual spikes indicate configuration issues",
          "Evidence export: schedule pnpm export:proof daily or after each batch of decisions",
          "Critical: loggingReady: false on any request = REJECT — ensure log service is always initialised",
        ],
      },
      {
        id: "adm-4",
        title: "Troubleshooting & Escalation",
        duration: "7 min",
        objectives: ["Know the self-service resolution path for common issues", "Know when and how to escalate to Jesse"],
        topics: [
          "Step 1: Use the Troubleshooter at /troubleshoot — covers 95% of common issues",
          "Step 2: Run pnpm audit:repo — read every check that fails",
          "Step 3: Run pnpm test — confirm all 419 tests still pass",
          "Step 4: Check the DecisionEnvelope trace.reasonCodes for the specific trigger code",
          "Escalate to jesse@lamontlabs.io with: full DecisionEnvelope, audit:repo output, test output, description",
          "Response within 1 business day during pilot support window",
          "Self-service target: 80% of issues resolved without escalation",
        ],
      },
    ],
  },
  {
    id: "developer",
    title: "Developer Integration",
    audience: "Engineers integrating CerbaSeal into a client system",
    icon: Code,
    color: "text-purple-400",
    bg: "bg-purple-950",
    border: "border-purple-800",
    totalTime: "Self-paced",
    modules: [
      {
        id: "dev-1",
        title: "Core Concepts",
        duration: "15 min",
        objectives: ["Understand the GovernedRequest/GateResult/EvidenceBundle lifecycle", "Understand the evaluation sequence", "Understand why fail-closed matters"],
        topics: [
          "The gate: ExecutionGateService.evaluate(request) → GateResult",
          "GateResult contains DecisionEnvelope (immutable, registered in WeakSet) + optional release/block records",
          "Evaluation runs 14 sequential checks — first failure short-circuits to HOLD or REJECT",
          "Fail-closed: every unexpected error produces REJECT, never ALLOW",
          "Evidence: EvidenceBundleService.createBundle(gateResult, log) assembles the full audit record",
          "The WeakSet: GateResults not produced by evaluate() are rejected by createBundle() — bypass prevention",
        ],
      },
      {
        id: "dev-2",
        title: "Integration Patterns",
        duration: "20 min",
        objectives: ["Choose the correct starter kit for your use case", "Understand the actor/approver boundary", "Know how to handle ALLOW, HOLD, and REJECT correctly"],
        topics: [
          "REST API (rest-api-starter): expose the gate as HTTP endpoints — use as sidecar or internal service",
          "Financial approval (financial-approval-starter): HOLD → human review → ALLOW lifecycle",
          "Fraud workflow (fraud-workflow-starter): risk scoring + FileBackedAppendOnlyLogService + persistent audit",
          "Agent integration (agent-integration-starter): AI proposes, system actor submits — never AI actor submitting",
          "Pattern: ALLOW → consume ReleaseAuthorization, execute action, log completion",
          "Pattern: HOLD → pause action, notify approver, await artifact, resubmit",
          "Pattern: REJECT → do not execute, log the block, notify operator",
        ],
      },
      {
        id: "dev-3",
        title: "Custom Authority Classes",
        duration: "10 min",
        objectives: ["Add a custom authority class without changing TypeScript source", "Verify the custom class is loaded correctly"],
        topics: [
          "Add to cerbaseal.config.json authorityClasses.extended[]",
          "Pass loadCerbaSealConfig() to ExecutionGateService constructor",
          "Verify: create a test request with the new class — should not produce UNKNOWN_ACTION_CLASS",
          "HumanAuthorityClass (for approvers) requires TypeScript change if you need a new approver class in the type — open an issue",
          "Runtime validation uses the extended set — compile-time types use the core union",
        ],
      },
      {
        id: "dev-4",
        title: "Testing Your Integration",
        duration: "Self-paced",
        objectives: ["Write integration tests that cover ALLOW, HOLD, and REJECT paths", "Test approval binding and timestamp validation", "Test your custom authority classes"],
        topics: [
          "Use real ExecutionGateService instances in tests — no mocking the enforcement core",
          "Test all three outcomes: ALLOW (all invariants pass), HOLD (approval missing), REJECT (invariant violation)",
          "Test approval binding: forRequestId must match — test the mismatch case explicitly",
          "Test AI authority: actorAuthorityClass: 'ai' with proposalSourceKind: 'ai' must produce REJECT",
          "Run pnpm check:invariants after adding tests — verify 12/12 invariants are covered",
          "See test/execution-gate-service.test.ts for ~120 examples of what to test",
        ],
      },
    ],
  },
];

export default function Training() {
  const [activeTrack, setActiveTrack] = useState<string>("executive");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const track = tracks.find((t) => t.id === activeTrack)!;
  const trackCompleted = track.modules.filter((m) => completed.has(m.id)).length;

  function toggleCompleted(id: string) {
    setCompleted((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Training Center</h1>
      </div>
      <p className="text-slate-400 mb-8 text-sm">Four tracks. Start where you need to start.</p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {tracks.map((t) => {
          const done = t.modules.filter((m) => completed.has(m.id)).length;
          return (
            <button key={t.id} onClick={() => setActiveTrack(t.id)}
              className={`${t.bg} border ${activeTrack === t.id ? t.border : "border-slate-800"} rounded-xl p-4 text-left hover:border-opacity-100 transition-all`}>
              <t.icon className={`w-5 h-5 ${t.color} mb-2`} />
              <div className="text-white font-semibold text-sm">{t.title}</div>
              <div className="text-slate-500 text-xs mt-0.5">{t.totalTime}</div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                <div className={`h-1 rounded-full transition-all ${t.color.replace("text-", "bg-")}`}
                  style={{ width: `${(done / t.modules.length) * 100}%` }} />
              </div>
              <div className="text-slate-500 text-xs mt-1">{done}/{t.modules.length} modules</div>
            </button>
          );
        })}
      </div>

      <div className={`${track.bg} border ${track.border} rounded-xl p-5 mb-6`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">{track.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-sm">{track.audience}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${track.color}`}>{track.totalTime}</div>
            <div className="text-slate-400 text-xs">{trackCompleted}/{track.modules.length} complete</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {track.modules.map((mod, idx) => {
          const done = completed.has(mod.id);
          return (
            <div key={mod.id} className={`bg-slate-900 border ${done ? "border-emerald-800" : "border-slate-800"} rounded-xl overflow-hidden`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${done ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{mod.title}</div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      {mod.duration}
                    </div>
                  </div>
                </div>
                <button onClick={() => toggleCompleted(mod.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${done ? "bg-emerald-900 text-emerald-400 hover:bg-red-900 hover:text-red-400" : "bg-slate-800 text-slate-400 hover:bg-emerald-900 hover:text-emerald-400"}`}>
                  {done ? "✓ Done" : "Mark done"}
                </button>
              </div>

              <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-xs font-bold mb-2 tracking-wide">OBJECTIVES</div>
                    {mod.objectives.map((obj) => (
                      <div key={obj} className="flex items-start gap-2 text-slate-300 text-sm mb-1.5">
                        <Play className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                        {obj}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold mb-2 tracking-wide">TOPICS COVERED</div>
                    {mod.topics.map((topic) => (
                      <div key={topic} className="flex items-start gap-2 text-slate-400 text-xs mb-1.5">
                        <span className="text-blue-500 mt-0.5">·</span>
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {trackCompleted === track.modules.length && (
        <div className="mt-6 bg-emerald-950 border border-emerald-800 rounded-xl p-5 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-white font-bold text-lg">Track Complete</div>
          <div className="text-slate-400 text-sm mt-1">{track.title} · {track.totalTime}</div>
          {activeTrack !== "developer" && (
            <button onClick={() => {
              const idx = tracks.findIndex((t) => t.id === activeTrack);
              if (idx < tracks.length - 1) setActiveTrack(tracks[idx + 1].id);
            }} className="mt-3 text-blue-400 text-sm hover:text-blue-300">
              Next track →
            </button>
          )}
        </div>
      )}
    </main>
  );
}
