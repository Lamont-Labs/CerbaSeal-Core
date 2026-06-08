import { Users, CheckCircle, ChevronRight, Star, Shield, Zap, Globe } from "lucide-react";

const certLevels = [
  {
    level: "L1", title: "Deployment Certified", color: "text-blue-400", bg: "bg-blue-950", border: "border-blue-800",
    desc: "Can deploy CerbaSeal into a client environment independently.",
    skills: ["Set up Node.js environment and dependencies", "Configure cerbaseal.config.json for client authority classes", "Configure FileBackedAppendOnlyLogService with durable log path", "Run pnpm audit:repo and confirm all 16 checks pass", "Verify all routes and scenarios using validation scripts"],
    assessment: "Deploy into a clean environment and pass all 16 audit checks independently.",
    time: "4 hours",
  },
  {
    level: "L2", title: "Onboarding Certified", color: "text-emerald-400", bg: "bg-emerald-950", border: "border-emerald-800",
    desc: "Can onboard client operators and technical owners independently.",
    skills: ["Deliver the Operator Training track to a client team", "Deliver the Admin Training track to a technical owner", "Guide workflow mapping and authority class configuration", "Conduct approval structure definition session", "Demonstrate ALLOW, HOLD, and REJECT scenarios to the client"],
    assessment: "Client operator independently constructs a valid ApprovalArtifact and resubmits a HOLD to ALLOW.",
    time: "L1 + 6 hours client-facing",
  },
  {
    level: "L3", title: "Pilot Certified", color: "text-amber-400", bg: "bg-amber-950", border: "border-amber-800",
    desc: "Can run a complete CerbaSeal pilot from kickoff to evidence package.",
    skills: ["Use the Pilot Generator to produce a complete pilot plan", "Manage a 45–90 day pilot from kickoff to completion", "Generate and review the evidence package with the client", "Handle first-line support using the Troubleshooter", "Deliver pilot completion debrief and conversion discussion"],
    assessment: "Complete a full pilot with a real or synthetic client workflow and deliver the evidence package.",
    time: "L2 + one completed pilot",
  },
  {
    level: "L4", title: "Independently Operating", color: "text-purple-400", bg: "bg-purple-950", border: "border-purple-800",
    desc: "Delivers CerbaSeal pilots with less than 1 hour of Jesse's involvement per engagement.",
    skills: ["All L1–L3 skills", "Resolve 80%+ of issues without escalation", "Handle client troubleshooting independently using all self-service tools", "Manage multi-stakeholder pilots with executive reporting", "Onboard new team members to L1/L2 independently"],
    assessment: "Two completed pilots with documented founder hours < 2h per pilot.",
    time: "L3 + two completed pilots",
  },
];

const channelModel = [
  {
    icon: Globe,
    title: "Platform Access Fee",
    desc: "Annual rights to deliver CerbaSeal pilots to your clients. Includes all updates, roadmap access, and support tier.",
    range: "€30,000 – €80,000/year",
    note: "Scales with partner tier and geographic/vertical scope.",
  },
  {
    icon: Zap,
    title: "Per-Pilot Royalty",
    desc: "Fee per client pilot delivered by the partner team. Volume discounts available for committed pilot numbers.",
    range: "€5,000 – €15,000 per pilot",
    note: "Lower end for validation pilots; higher for regulated evidence pilots.",
  },
  {
    icon: Star,
    title: "Exclusivity Premium",
    desc: "Geographic or vertical exclusivity — e.g. EU financial services, Nordic markets, insurance sector.",
    range: "1.5×–3× access fee",
    note: "Requires minimum annual pilot commitment and performance review.",
  },
  {
    icon: Shield,
    title: "Co-Delivery Support",
    desc: "Jesse's time on strategic accounts alongside the partner team. Available as day rate or retained hours.",
    range: "Day rate or retained",
    note: "Typically only required for L4 accounts with complex regulatory requirements.",
  },
];

const partnerKitDocs = [
  { title: "Partner Kit — Overview", path: "docs/partner-kit/00-OVERVIEW.md", desc: "Kit index, how to use it, the three certification levels, supporting tools, and what requires Jesse vs. what is self-service." },
  { title: "Sales Brief", path: "docs/partner-kit/01-sales-brief.md", desc: "2-page narrative for live sales conversations: positioning, 3 qualification questions, and objection handling for the 5 most common responses." },
  { title: "Technical Brief", path: "docs/partner-kit/02-technical-brief.md", desc: "Architecture overview: the 7 layers, 12 invariants in plain English, 3 decision outcomes, and a whiteboard diagram description." },
  { title: "Deployment Guide", path: "docs/partner-kit/03-deployment-guide.md", desc: "Step-by-step guide for a partner technical lead: prerequisites, setup, policy authoring, integration kit selection, verification, and handoff checklist." },
  { title: "1-Day Pilot Guide", path: "docs/partner-kit/04-pilot-guide.md", desc: "The CerbaSeal Express Pilot: 5-session day agenda from workflow mapping to evidence package. Includes the client-facing agenda template." },
  { title: "Support Guide", path: "docs/partner-kit/05-support-guide.md", desc: "10 most common partner issues with symptoms, diagnosis steps, and resolution. Covers gate outcomes, chain verification, and artifact failures." },
  { title: "Objection Handling", path: "docs/partner-kit/06-objection-handling.md", desc: "8 enterprise objections with 2–3 response paths per objection, calibrated for security, compliance, and technical buyer personas." },
  { title: "Certification Framework", path: "docs/partner-kit/07-certification-framework.md", desc: "Three certification levels with explicit competencies, practical exercises, and pass/fail checklists. Level 1: Deploy. Level 2: Configure. Level 3: Lead Pilots." },
];

const resources = [
  { title: "Integration Guide", path: "examples/INTEGRATION-GUIDE.md", desc: "Decision tree: match your architecture to the right starter kit. Covers synchronous API, async queue, webhook, middleware, and audit consumer patterns." },
  { title: "Integration Starter Kit — REST API", path: "examples/rest-api-starter/", desc: "HTTP wrapper exposing the gate as API endpoints. Includes sample-request.json for testing." },
  { title: "Integration Starter Kit — Financial Approval", path: "examples/financial-approval-starter/", desc: "HOLD → human review → ALLOW lifecycle. Demonstrates the full approval loop." },
  { title: "Integration Starter Kit — Fraud Workflow", path: "examples/fraud-workflow-starter/", desc: "Risk-scored triage with FileBackedAppendOnlyLogService. Persistent JSONL audit log." },
  { title: "Integration Starter Kit — Agent Integration", path: "examples/agent-integration-starter/", desc: "Correct AI agent pattern: AI proposes, system actor submits. Includes wrong-pattern demo." },
  { title: "Integration Starter Kit — Webhook Adapter", path: "examples/webhook-adapter/", desc: "CerbaSeal as a webhook receiver. POST /event → gate → POST to callback URL. Shows async approval loop via webhook." },
  { title: "Integration Starter Kit — Express Middleware", path: "examples/express-middleware/", desc: "Drop-in cerbaSealGate() middleware for Express.js. ALLOW → next(), REJECT → 403, HOLD → 202 with hold reference." },
  { title: "Integration Starter Kit — Async Queue", path: "examples/async-queue/", desc: "In-memory JobQueue: AI proposes → gate holds → reviewer approves → job released. Replace internals with any queue backend." },
  { title: "Integration Starter Kit — Audit Export", path: "examples/audit-export/", desc: "Reads a JSONL audit log from FileBackedAppendOnlyLogService. Verifies chain integrity and exports a formatted evidence summary." },
  { title: "Workflow Config Generator", path: "pnpm generate:pilot-config", desc: "Client fills wizard-input.json → generates 4-file pilot config package." },
  { title: "Evidence Report Generator", path: "pnpm generate:evidence-report", desc: "Reads proof-snapshot.json → produces 3-file compliance evidence package." },
  { title: "Founder Independence Kit", path: "docs/FOUNDER-INDEPENDENCE-KIT.md", desc: "Master index: 7 adoption stages from client qualification to compliance review." },
  { title: "Deployment Checklist", path: "docs/deployment/pilot-deployment-checklist.md", desc: "Step-by-step deployment verification. Confirmed to pass all 16 audit checks." },
  { title: "Troubleshooting Guide", path: "docs/client-adoption/troubleshooting-guide.md", desc: "Self-serve resolution for the most common deployment and integration issues." },
  { title: "Workflow Mapping Workbook", path: "docs/client-adoption/workflow-mapping-workbook.md", desc: "Structured workbook for mapping a client workflow to CerbaSeal enforcement points before pilot begins." },
  { title: "Pilot Delivery Audit (Jun 2026)", path: "docs/repo-audit/pilot-delivery-audit.md", desc: "Full friction analysis of every pilot step. Founder-hours by phase: current 15–29h → target 3–8h." },
  { title: "Partner Readiness Scorecard (Jun 2026)", path: "docs/repo-audit/partner-readiness-scorecard.md", desc: "Current partner readiness scored 0–100 across 6 categories. Identifies the critical path to independent delivery." },
  { title: "Founder Dependency Audit (Jun 2026)", path: "docs/repo-audit/founder-dependency-audit.md", desc: "Every workflow where Jesse is required today, with AUTOMATE / DOCUMENT / WIZARD recommendations and priority scores." },
  { title: "Repository Audit — Executive Summary", path: "docs/repo-audit/executive-summary.md", desc: "Top risks, quick wins, strategic priorities, and founder-hours reduction roadmap from the June 2026 full audit." },
  { title: "Deployment Starter", path: "deployment-starter/", desc: "Minimal, self-contained deployment template. Dockerfile, docker-compose.yml, .env.template, HTTP server with /evaluate and /health." },
  { title: "Docker Quickstart", path: "deployment-starter/docker-compose.yml", desc: "One command: docker compose up. Mounts ./data for audit log, exposes port 3000, includes healthcheck. No Node.js tooling required on client machine." },
  { title: "Quickstart Operator Guide", path: "docs/deployment/quickstart-operator-guide.md", desc: "Deployment guide with two paths: Docker (Option A) and Node.js direct (Option B). Covers audit, verification, and next steps." },
];

const agreementItems = [
  "Scope of rights — which workflows, geographies, and verticals (exclusivity boundaries)",
  "Partner obligations — minimum pilots per year, certification requirements, support coverage",
  "Royalty structure — per-pilot fee, per-seat fee, or revenue share",
  "Support boundary — what the partner handles vs. what escalates to Jesse",
  "Exclusivity terms — duration, renewal conditions, performance requirements to maintain",
  "Co-marketing and reference rights — what the partner can state publicly about the relationship",
  "IP protections — what the partner can and cannot modify, white-label, or redistribute",
  "Certification requirements — required level before delivering pilots (minimum L2)",
];

export default function Partner() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-6 h-6 text-rose-400" />
        <h1 className="text-2xl font-bold text-white">Partner Enablement Kit</h1>
      </div>
      <p className="text-slate-400 mb-8 text-sm">Everything a consulting partner needs to deliver CerbaSeal pilots independently.</p>

      <div className="bg-rose-950 border border-rose-800 rounded-xl p-5 mb-8">
        <div className="text-rose-400 text-xs font-bold mb-2 tracking-wide">THE CHANNEL MODEL</div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          A channel partner relationship is not Client → CerbaSeal. It is{" "}
          <span className="text-white font-semibold">Client → Partner → CerbaSeal.</span>{" "}
          The partner embeds CerbaSeal in their practice and delivers pilots to their clients. Jesse provides the product, roadmap, and second-line support. The partner provides first-line delivery.
        </p>
        <p className="text-slate-400 text-sm">
          The commercial question for a partner is not "what does a pilot cost?" — it is "what is CerbaSeal worth to a firm that delivers it across 10, 20, or 50 client engagements?"
        </p>
      </div>

      {/* Channel pricing model */}
      <h2 className="text-white font-bold text-xl mb-4">Channel Pricing Structure</h2>
      <div className="grid grid-cols-2 gap-4 mb-10">
        {channelModel.map((item) => (
          <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <item.icon className="w-5 h-5 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">{item.title}</h3>
            <p className="text-slate-400 text-sm mb-3">{item.desc}</p>
            <div className="bg-slate-800 rounded-lg px-3 py-2 mb-2">
              <span className="text-blue-400 font-bold text-sm">{item.range}</span>
            </div>
            <p className="text-slate-500 text-xs">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Certification path */}
      <h2 className="text-white font-bold text-xl mb-2">Partner Certification Path</h2>
      <p className="text-slate-400 text-sm mb-5">
        Goal: Partner does 90%. Jesse does 10%.{" "}
        <span className="text-slate-300">Minimum L2 required before delivering client pilots independently.</span>
      </p>
      <div className="space-y-4 mb-10">
        {certLevels.map((cert) => (
          <div key={cert.level} className={`${cert.bg} border ${cert.border} rounded-xl p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${cert.bg} border ${cert.border} flex items-center justify-center`}>
                  <span className={`font-bold text-lg ${cert.color}`}>{cert.level}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">{cert.title}</h3>
                  <p className="text-slate-400 text-sm">{cert.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-xs">Time investment</div>
                <div className={`${cert.color} font-medium text-sm`}>{cert.time}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-400 text-xs font-bold mb-2 tracking-wide">SKILLS</div>
                {cert.skills.map((skill) => (
                  <div key={skill} className="flex items-start gap-2 text-slate-300 text-xs mb-1.5">
                    <CheckCircle className={`w-3 h-3 ${cert.color} flex-shrink-0 mt-0.5`} />
                    {skill}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold mb-2 tracking-wide">ASSESSMENT CRITERIA</div>
                <div className={`${cert.bg} border ${cert.border} rounded-lg p-3`}>
                  <p className="text-slate-200 text-xs">{cert.assessment}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Partner Kit */}
      <h2 className="text-white font-bold text-xl mb-2">Partner Delivery Kit</h2>
      <p className="text-slate-400 text-sm mb-4">
        Everything a partner needs to sell, deploy, configure, and support a CerbaSeal pilot — without founder involvement.
        Located in <code className="text-blue-400">docs/partner-kit/</code>.
      </p>
      <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 mb-4">
        <div className="text-slate-400 text-xs font-bold mb-3 tracking-wide">KIT CERTIFICATION LEVELS</div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { level: "L1", name: "Deploy", color: "text-blue-400", border: "border-blue-800", bg: "bg-blue-950", desc: "Can stand up CerbaSeal and verify it works. Required before any client deployment." },
            { level: "L2", name: "Configure", color: "text-emerald-400", border: "border-emerald-800", bg: "bg-emerald-950", desc: "Can author a policy pack for a new client without assistance. Required before unsupervised pilot delivery." },
            { level: "L3", name: "Lead Pilots", color: "text-amber-400", border: "border-amber-800", bg: "bg-amber-950", desc: "Can run a full pilot engagement independently from kickoff to evidence package." },
          ].map((c) => (
            <div key={c.level} className={`${c.bg} border ${c.border} rounded-lg p-3`}>
              <div className={`font-bold text-lg ${c.color} mb-1`}>{c.level} — {c.name}</div>
              <p className="text-slate-300 text-xs">{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs">Full competencies, practical exercises, and pass/fail checklists in <code className="text-blue-400">docs/partner-kit/07-certification-framework.md</code></p>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-10">
        {partnerKitDocs.map((r) => (
          <div key={r.title} className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-start gap-4">
            <ChevronRight className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-medium text-sm">{r.title}</div>
              <code className="text-blue-400 text-xs">{r.path}</code>
              <p className="text-slate-400 text-xs mt-0.5">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <h2 className="text-white font-bold text-xl mb-4">Partner Resource Library</h2>
      <div className="grid grid-cols-1 gap-2 mb-10">
        {resources.map((r) => (
          <div key={r.title} className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-start gap-4">
            <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-medium text-sm">{r.title}</div>
              <code className="text-blue-400 text-xs">{r.path}</code>
              <p className="text-slate-400 text-xs mt-0.5">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agreement items */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="text-slate-400 text-xs font-bold mb-4 tracking-wide">WHAT A CHANNEL AGREEMENT MUST COVER</div>
        <div className="grid grid-cols-2 gap-2">
          {agreementItems.map((item) => (
            <div key={item} className="flex items-start gap-2 text-slate-300 text-sm">
              <CheckCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            <span className="text-white font-medium">Support boundary is critical.</span>{" "}
            Define exactly what the partner handles vs. what escalates to Jesse before the first client engagement. This is the single most important item for protecting founder time.
          </p>
        </div>
      </div>
    </main>
  );
}
