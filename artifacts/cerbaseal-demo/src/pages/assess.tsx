import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Choice = { label: string; score: number; note?: string };
type Question = { id: string; text: string; category: string; choices: Choice[] };

const questions: Question[] = [
  // Technical environment
  { id: "env", category: "Technical Environment", text: "What best describes your target deployment environment?",
    choices: [
      { label: "Cloud-managed (AWS, Azure, GCP) — we control the environment", score: 3 },
      { label: "On-premise — our team manages the server infrastructure", score: 2 },
      { label: "Client-controlled edge / hybrid — mixed ownership", score: 1 },
      { label: "Not yet determined", score: 0 },
    ]
  },
  { id: "node", category: "Technical Environment", text: "Which Node.js runtime version is available in your target environment?",
    choices: [
      { label: "Node.js 20 LTS or higher", score: 3 },
      { label: "Node.js 18 LTS", score: 3 },
      { label: "Node.js 16 or lower — may need upgrade", score: 1 },
      { label: "Unknown — needs discovery", score: 0 },
    ]
  },
  { id: "secrets", category: "Technical Environment", text: "How are environment secrets and configuration managed?",
    choices: [
      { label: "Secret manager (Vault, AWS SSM, Azure Key Vault)", score: 3 },
      { label: ".env files with a clear per-environment strategy", score: 2 },
      { label: "Manual — set by hand per deployment", score: 1 },
      { label: "No clear strategy yet", score: 0 },
    ]
  },
  { id: "logs", category: "Technical Environment", text: "Where will audit logs be stored?",
    choices: [
      { label: "Persistent file system with backup — logs survive restarts", score: 3 },
      { label: "In-memory for development, persistent in production", score: 2 },
      { label: "In-memory only — acceptable for this pilot scope", score: 1 },
      { label: "Not decided yet", score: 0 },
    ]
  },

  // Team capability
  { id: "dev", category: "Team Capability", text: "What is the technical capability of the team deploying CerbaSeal?",
    choices: [
      { label: "Strong — TypeScript/Node.js engineers who can read and adapt source", score: 3 },
      { label: "Capable — can follow documented instructions and run provided scripts", score: 2 },
      { label: "Limited — needs guided walkthrough for most steps", score: 1 },
      { label: "No internal technical resource identified yet", score: 0 },
    ]
  },
  { id: "owner", category: "Team Capability", text: "Is there a named technical owner for the CerbaSeal integration?",
    choices: [
      { label: "Yes — named, available, and briefed", score: 3 },
      { label: "Yes — named but not yet briefed", score: 2 },
      { label: "Informal — someone will do it but not officially assigned", score: 1 },
      { label: "No — needs to be identified", score: 0 },
    ]
  },
  { id: "support", category: "Team Capability", text: "Who will handle first-line support during the pilot?",
    choices: [
      { label: "Internal team can handle operational questions independently", score: 3 },
      { label: "Partner / consulting firm with CerbaSeal experience", score: 3 },
      { label: "Shared — some internal, some escalated to Jesse", score: 1 },
      { label: "Jesse directly for all issues — no internal capability yet", score: 0 },
    ]
  },

  // Workflow definition
  { id: "workflow", category: "Workflow Definition", text: "How clearly is the target workflow defined?",
    choices: [
      { label: "Fully defined — we know every actor, action, and approval step", score: 3 },
      { label: "Mostly defined — one or two approval paths still being confirmed", score: 2 },
      { label: "Partially defined — we know the use case but not all the details", score: 1 },
      { label: "Exploratory — we need discovery before we can define it", score: 0 },
    ]
  },
  { id: "actions", category: "Workflow Definition", text: "What action classes does your workflow require?",
    choices: [
      { label: "Standard actions only: allow, hold, reject, escalate, account_hold", score: 3 },
      { label: "Standard actions plus 1–2 custom authority classes needed", score: 2 },
      { label: "Significant custom authority class requirements", score: 1 },
      { label: "Unknown — needs workflow mapping", score: 0 },
    ]
  },
  { id: "approval", category: "Workflow Definition", text: "What is the human approval structure?",
    choices: [
      { label: "Clear — named approver roles, authority levels, and sign-off process defined", score: 3 },
      { label: "Mostly clear — roles identified but sign-off process needs formalizing", score: 2 },
      { label: "In progress — roles being defined during pilot scoping", score: 1 },
      { label: "Not yet defined", score: 0 },
    ]
  },

  // Compliance requirements
  { id: "regulation", category: "Compliance & Evidence", text: "What is your primary regulatory context?",
    choices: [
      { label: "No specific regulatory requirement — internal governance only", score: 3 },
      { label: "Moderate — internal audit, SOC 2, or ISO 27001 evidence needed", score: 2 },
      { label: "Significant — EU AI Act, financial services regulation, or equivalent", score: 1, note: "Tier 3 Regulated Evidence Pilot recommended" },
      { label: "High-stakes — healthcare, legal, government, or critical infrastructure", score: 1, note: "Tier 3 or Tier 4 recommended — needs specialist review" },
    ]
  },
  { id: "evidence", category: "Compliance & Evidence", text: "What evidence output is required from the pilot?",
    choices: [
      { label: "Basic — we want to see it works and have a record of decisions", score: 3 },
      { label: "Standard — governance summary, decision log, audit chain verification", score: 2 },
      { label: "Formal — evidence package reviewed by compliance or legal team", score: 1 },
      { label: "Regulatory submission — evidence must meet external standards", score: 0, note: "Needs specialist scoping before pilot begins" },
    ]
  },
  { id: "timeline", category: "Compliance & Evidence", text: "What is the realistic timeline for this pilot?",
    choices: [
      { label: "30–45 days — we're ready to start quickly", score: 3 },
      { label: "45–90 days — standard controlled workflow pilot timeline", score: 3 },
      { label: "90–120 days — needs stakeholder alignment and staged rollout", score: 2 },
      { label: "Unknown — depends on internal approvals", score: 1 },
    ]
  },
  { id: "stakeholders", category: "Compliance & Evidence", text: "How many stakeholder groups need to be involved?",
    choices: [
      { label: "1 team — single technical owner and sponsor", score: 3 },
      { label: "2 teams — technical team + compliance or legal sign-off", score: 2 },
      { label: "3+ teams — multiple departments, procurement, or security review", score: 1, note: "+10–25% price adjustment applies" },
      { label: "Enterprise-wide — executive reporting required", score: 0, note: "Tier 4 Strategic Anchor Pilot recommended" },
    ]
  },
  { id: "security", category: "Compliance & Evidence", text: "Is a security or procurement review required before deployment?",
    choices: [
      { label: "No — straightforward internal deployment", score: 3 },
      { label: "Light — brief security questionnaire or vendor assessment", score: 2 },
      { label: "Formal — full security review, DPIA, or vendor onboarding process", score: 1, note: "+10–25% price adjustment and timeline extension applies" },
      { label: "Extensive — government procurement, regulated vendor process", score: 0 },
    ]
  },
  { id: "data", category: "Compliance & Evidence", text: "What data will the pilot workflow govern?",
    choices: [
      { label: "Synthetic or test data only — no real customer data in scope", score: 3 },
      { label: "Internal data — no customer PII in the governed workflow", score: 2 },
      { label: "Production-adjacent — real workflow, controlled environment", score: 2 },
      { label: "Live production data with customer PII", score: 1, note: "Requires data handling review before deployment" },
    ]
  },
];

type Verdict = "READY" | "READY_WITH_SUPPORT" | "NOT_READY";

function computeResult(answers: Record<string, number>): {
  verdict: Verdict;
  score: number;
  max: number;
  pct: number;
  hours: string;
  tier: string;
  gaps: string[];
} {
  const vals = Object.values(answers);
  const score = vals.reduce((a, b) => a + b, 0);
  const max = questions.length * 3;
  const pct = Math.round((score / max) * 100);

  const verdict: Verdict = pct >= 70 ? "READY" : pct >= 45 ? "READY_WITH_SUPPORT" : "NOT_READY";
  const hours = pct >= 70 ? "2–4 hours" : pct >= 45 ? "5–10 hours" : "12+ hours (discovery phase recommended first)";

  const tierScore = answers["regulation"] ?? 3;
  const stakeScore = answers["stakeholders"] ?? 3;
  const tier = tierScore <= 1 || stakeScore <= 1
    ? "Tier 3 — Regulated Evidence Pilot (€75k–€150k)"
    : stakeScore === 0
    ? "Tier 4 — Strategic Anchor Pilot (€150k–€250k+)"
    : pct >= 70
    ? "Tier 2 — Controlled Workflow Pilot (€35k–€75k)"
    : pct >= 45
    ? "Tier 1 — Validation Pilot (€15k–€35k)"
    : "Tier 0 — Discovery / Readiness Assessment (€5k–€15k)";

  const gaps: string[] = [];
  if ((answers["owner"] ?? 3) < 2) gaps.push("No named technical owner — assign before pilot begins");
  if ((answers["workflow"] ?? 3) < 2) gaps.push("Workflow not sufficiently defined — discovery session required");
  if ((answers["dev"] ?? 3) < 2) gaps.push("Team technical capability low — budget for additional onboarding time");
  if ((answers["approval"] ?? 3) < 2) gaps.push("Approval structure undefined — formal authority mapping needed");
  if ((answers["support"] ?? 3) < 1) gaps.push("No first-line support plan — Jesse will be primary support (high founder dependency)");
  if ((answers["logs"] ?? 3) < 1) gaps.push("Audit log storage not decided — required before production deployment");
  if ((answers["node"] ?? 3) < 2) gaps.push("Node.js version may require upgrade before deployment");
  if ((answers["security"] ?? 3) < 2) gaps.push("Security or procurement review required — add 4–8 weeks to timeline");

  return { verdict, score, max, pct, hours, tier, gaps };
}

const categories = [...new Set(questions.map((q) => q.category))];

export default function Assess() {
  const [step, setStep] = useState(0);  // 0 = intro, 1-4 = categories, 5 = results
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Record<string, number>>({});

  const catQuestions = (cat: string) => questions.filter((q) => q.category === cat);
  const currentCat = categories[step - 1];
  const currentQs = step >= 1 && step <= categories.length ? catQuestions(currentCat) : [];

  const canAdvance = step === 0 || currentQs.every((q) => q.id in selected);

  function advance() {
    const merged = { ...answers, ...selected };
    setAnswers(merged);
    setSelected({});
    setStep((s) => s + 1);
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setSelected({});
  }

  const totalSteps = categories.length + 2; // intro + cats + results

  if (step === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Readiness Assessment</h1>
        <p className="text-slate-400 mb-8">16 questions · 4 categories · ~8 minutes · instant verdict</p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-3">What you'll get</h2>
          {["A READY / READY WITH SUPPORT / NOT READY verdict", "Estimated founder onboarding hours for your specific situation", "Recommended pilot tier (Tier 0 → Tier 4)", "Specific gaps to address before the pilot begins"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {categories.map((cat) => (
            <div key={cat} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Category</div>
              <div className="text-white text-sm font-medium">{cat}</div>
              <div className="text-slate-500 text-xs">{catQuestions(cat).length} questions</div>
            </div>
          ))}
        </div>
        <Button onClick={advance} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
          Begin Assessment <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </main>
    );
  }

  if (step > categories.length) {
    const r = computeResult(answers);
    const verdictConfig = {
      READY: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-950 border-emerald-800", label: "READY", desc: "Your environment and team profile indicate a successful pilot is achievable. Proceed to the Pilot Generator." },
      READY_WITH_SUPPORT: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-950 border-amber-800", label: "READY WITH SUPPORT", desc: "Some gaps identified that will require additional onboarding effort. Address the items below before the pilot begins." },
      NOT_READY: { icon: XCircle, color: "text-red-400", bg: "bg-red-950 border-red-800", label: "NOT READY — Discovery First", desc: "Significant gaps need to be resolved. A Tier 0 Discovery engagement is recommended before committing to a pilot." },
    }[r.verdict];

    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Assessment Complete</h1>
        <div className={`${verdictConfig.bg} border rounded-xl p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-3">
            <verdictConfig.icon className={`w-8 h-8 ${verdictConfig.color}`} />
            <div className={`text-xl font-bold ${verdictConfig.color}`}>{verdictConfig.label}</div>
          </div>
          <p className="text-slate-300 text-sm">{verdictConfig.desc}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{r.score}/{r.max}</div>
            <div className="text-slate-400 text-xs mt-1">Readiness score</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{r.pct}%</div>
            <div className="text-slate-400 text-xs mt-1">Percentage</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-amber-400">{r.hours}</div>
            <div className="text-slate-400 text-xs mt-1">Est. onboarding hours</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="text-slate-400 text-xs font-bold mb-1 tracking-wide">RECOMMENDED PILOT TIER</div>
          <div className="text-white font-semibold">{r.tier}</div>
        </div>

        {r.gaps.length > 0 && (
          <div className="bg-slate-900 border border-amber-900 rounded-xl p-4 mb-5">
            <div className="text-amber-400 text-xs font-bold mb-3 tracking-wide">GAPS TO RESOLVE BEFORE PILOT</div>
            {r.gaps.map((gap) => (
              <div key={gap} className="flex items-start gap-2 text-slate-300 text-sm mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                {gap}
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="text-slate-400 text-xs font-bold mb-2 tracking-wide">NEXT STEPS</div>
          {(r.verdict === "READY"
            ? ["Use the Pilot Generator to create your pilot plan", "Share the plan with your technical owner and sponsor", "Schedule a kickoff with the CerbaSeal team"]
            : r.verdict === "READY_WITH_SUPPORT"
            ? ["Address the gaps listed above", "Use the Pilot Generator to create a draft plan", "Review the Training Center for your team's track"]
            : ["Schedule a Tier 0 Discovery engagement", "Use the Troubleshooter to address immediate issues", "Review the Partner Kit if you're working through a consulting partner"]
          ).map((step) => (
            <div key={step} className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              {step}
            </div>
          ))}
        </div>

        <Button onClick={reset} variant="outline" className="w-full border-slate-700 text-slate-300">
          <RotateCcw className="w-4 h-4 mr-2" /> Retake Assessment
        </Button>
      </main>
    );
  }

  const progress = Math.round(((step - 1) / categories.length) * 100);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-white">{currentCat}</h1>
        <span className="text-slate-500 text-sm">Step {step} of {categories.length}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-8">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-6">
        {currentQs.map((q) => (
          <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-white font-medium mb-4">{q.text}</p>
            <div className="space-y-2">
              {q.choices.map((choice) => {
                const isSelected = selected[q.id] === choice.score && selected[q.id] !== undefined;
                return (
                  <button
                    key={choice.label}
                    onClick={() => setSelected((s) => ({ ...s, [q.id]: choice.score }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-950 text-white"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {choice.label}
                    {choice.note && <span className="block text-xs text-amber-400 mt-1">{choice.note}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <Button onClick={() => setStep((s) => Math.max(0, s - 1))} variant="outline" className="border-slate-700 text-slate-300">
          Back
        </Button>
        <Button onClick={advance} disabled={!canAdvance} className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40">
          {step === categories.length ? "See Results" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </main>
  );
}
