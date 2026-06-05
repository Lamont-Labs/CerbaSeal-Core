import { useState } from "react";
import { Rocket, Download, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PilotForm {
  company: string;
  contactName: string;
  workflow: string;
  workflowDesc: string;
  actors: string;
  approvers: string;
  approvalTrigger: string;
  deployMode: string;
  duration: string;
  evidenceLevel: string;
  successCriteria: string;
  tier: string;
}

const empty: PilotForm = {
  company: "", contactName: "", workflow: "", workflowDesc: "",
  actors: "", approvers: "", approvalTrigger: "",
  deployMode: "client-controlled", duration: "60",
  evidenceLevel: "standard", successCriteria: "", tier: "tier2",
};

function select(value: string, onChange: (v: string) => void, options: [string, string][]) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function field(label: string, node: React.ReactNode, hint?: string) {
  return (
    <div>
      <Label className="text-slate-300 text-sm mb-1.5 block">{label}</Label>
      {node}
      {hint && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function PilotPlan({ form }: { form: PilotForm }) {
  const date = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  const durationLabel = { "30": "30 days", "45": "45 days", "60": "60 days", "90": "90 days", "120": "120 days" }[form.duration] ?? form.duration + " days";
  const tierLabel = { tier0: "Tier 0 — Discovery", tier1: "Tier 1 — Validation Pilot", tier2: "Tier 2 — Controlled Workflow Pilot", tier3: "Tier 3 — Regulated Evidence Pilot", tier4: "Tier 4 — Strategic Anchor Pilot" }[form.tier] ?? form.tier;
  const priceRange = { tier0: "€5,000 – €15,000", tier1: "€15,000 – €35,000", tier2: "€35,000 – €75,000", tier3: "€75,000 – €150,000", tier4: "€150,000 – €250,000+" }[form.tier] ?? "TBD";

  const section = (title: string, content: React.ReactNode) => (
    <div className="mb-6">
      <div className="text-blue-400 text-xs font-bold tracking-wide mb-2 uppercase">{title}</div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );

  const row = (label: string, value: string) => (
    <div className="flex gap-2 mb-1.5" key={label}>
      <span className="text-slate-500 w-36 flex-shrink-0">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  );

  const actors = form.actors.split(",").map((s) => s.trim()).filter(Boolean);
  const approvers = form.approvers.split(",").map((s) => s.trim()).filter(Boolean);
  const criteria = form.successCriteria
    ? form.successCriteria.split("\n").filter(Boolean)
    : ["Gate correctly enforces ALLOW, HOLD, and REJECT on all test scenarios", "At least one real workflow request successfully processed through the gate", "Audit chain verified — all hash links valid", "Evidence package generated and reviewed by designated stakeholder", "Operator trained and able to run pnpm demo:support:validate independently"];

  return (
    <div className="text-left" id="pilot-plan-output">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="text-slate-400 text-xs mb-1">CERBASEAL PILOT PLAN</div>
        <h2 className="text-white text-xl font-bold mb-0.5">{form.company || "[Company Name]"} × CerbaSeal</h2>
        <div className="text-slate-400 text-sm">{form.workflow || "[Workflow Name]"} · {tierLabel}</div>
        <div className="text-slate-500 text-xs mt-2">Generated: {date} · Contact: {form.contactName || "TBD"}</div>
      </div>

      {section("1. Engagement Overview", <>
        {row("Client", form.company || "TBD")}
        {row("Contact", form.contactName || "TBD")}
        {row("Workflow", form.workflow || "TBD")}
        {row("Pilot tier", tierLabel)}
        {row("Commercial range", priceRange)}
        {row("Duration", durationLabel)}
        {row("Deployment mode", form.deployMode === "client-controlled" ? "Client-controlled environment" : form.deployMode === "sandbox" ? "Sandbox / non-production" : "Production-adjacent")}
      </>)}

      {section("2. Workflow Description", <p>{form.workflowDesc || "To be defined during kickoff. Document the workflow governing actions, trigger conditions, actor roles, and approval requirements."}</p>)}

      {section("3. Actors & Approvals", <>
        <div className="mb-2 font-medium text-slate-200">Actors submitting requests:</div>
        {actors.length > 0 ? actors.map((a) => <div key={a} className="flex items-center gap-2 mb-1"><CheckCircle className="w-3.5 h-3.5 text-blue-400" />{a}</div>) : <div className="text-slate-500 italic">To be defined during workflow mapping</div>}
        <div className="mt-3 mb-2 font-medium text-slate-200">Approver roles:</div>
        {approvers.length > 0 ? approvers.map((a) => <div key={a} className="flex items-center gap-2 mb-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" />{a}</div>) : <div className="text-slate-500 italic">To be defined during approval authority mapping</div>}
        <div className="mt-3"><span className="text-slate-400">Approval trigger: </span>{form.approvalTrigger || "Defined per workflow class — fraud_triage always requires approval regardless of request flag"}</div>
      </>)}

      {section("4. Success Criteria", <ul>{criteria.map((c, i) => <li key={i} className="flex items-start gap-2 mb-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />{c}</li>)}</ul>)}

      {section("5. Deployment Checklist", <>
        {["Confirm Node.js ≥18 in target environment", "Set PORT and BASE_PATH environment variables", "Configure cerbaseal.config.json with client authority and workflow classes", "Verify loggingReady: true in all requests before production use", "Run pnpm audit:repo — confirm 15/15 checks pass", "Run pnpm demo:web:validate — confirm all routes respond correctly", "Configure FileBackedAppendOnlyLogService with durable log path", "Run pnpm export:proof to generate proof-snapshot.json", "Run pnpm generate:evidence-report to confirm evidence package generates", "Conduct operator walkthrough — demonstrate ALLOW, HOLD, REJECT scenarios"].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <div className="w-5 h-5 rounded border border-slate-600 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
      </>)}

      {section("6. Support Plan", <>
        {row("Support channel", "jesse@lamontlabs.io — response within 1 business day during pilot")}
        {row("Self-service first", "Use Troubleshooter at /troubleshoot before contacting support")}
        {row("Escalation", "If Troubleshooter does not resolve: email with error output + pnpm audit:repo results")}
        {row("Support scope", "Gate configuration, invariant failures, audit chain issues, evidence generation")}
        {row("Out of scope", "Client environment setup, general Node.js/TypeScript questions, custom development")}
      </>)}

      {section("7. Evidence Requirements", <>
        {row("Evidence level", { standard: "Standard", basic: "Basic", formal: "Formal (compliance review)", regulatory: "Regulatory submission" }[form.evidenceLevel] ?? form.evidenceLevel)}
        {row("Generated by", "pnpm export:proof && pnpm generate:evidence-report")}
        {row("Output files", "governance-summary.md · decision-summary.json · audit-integrity-summary.md")}
        {form.evidenceLevel === "formal" && row("Formal review", "Evidence package to be reviewed by designated compliance or legal stakeholder before pilot close")}
        {form.evidenceLevel === "regulatory" && row("External review", "Evidence package to be reviewed by external regulatory contact — specialist scoping required")}
      </>)}

      {section("8. Pilot Phases", <>
        {[
          ["Week 1", "Kickoff · Environment setup · cerbaseal.config.json configuration · authority class mapping"],
          ["Week 2", "Workflow mapping · approval authority structure · test scenario design"],
          ["Week 3–4", "Integration deployment · test scenarios executed · operator training"],
          [form.duration === "30" ? "Week 4–5" : "Week 4–6", "Live testing in target environment · evidence generation · gap resolution"],
          ["Final week", "Evidence package review · stakeholder debrief · pilot completion report · conversion discussion"],
        ].map(([phase, desc]) => (
          <div key={phase} className="mb-2">
            <span className="text-blue-400 font-medium">{phase}:</span>{" "}
            <span className="text-slate-300">{desc}</span>
          </div>
        ))}
      </>)}
    </div>
  );
}

export default function PilotGenerator() {
  const [form, setForm] = useState<PilotForm>(empty);
  const [generated, setGenerated] = useState(false);

  const set = (key: keyof PilotForm) => (val: string) => setForm((f) => ({ ...f, [key]: val }));
  const inp = (key: keyof PilotForm, placeholder?: string) => (
    <Input value={form[key]} onChange={(e) => set(key)(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500" />
  );
  const ta = (key: keyof PilotForm, placeholder?: string, rows = 3) => (
    <textarea value={form[key]} onChange={(e) => set(key)(e.target.value)}
      placeholder={placeholder} rows={rows}
      className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none" />
  );

  if (generated) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Pilot Plan Generated</h1>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <Download className="w-4 h-4 mr-1" /> Print / Save
            </Button>
            <Button onClick={() => setGenerated(false)} variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <RotateCcw className="w-4 h-4 mr-1" /> Edit
            </Button>
          </div>
        </div>
        <PilotPlan form={form} />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Rocket className="w-6 h-6 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Pilot Generator</h1>
      </div>
      <p className="text-slate-400 mb-8 text-sm">Fill in the details below. Get a complete, shareable pilot plan in 5 minutes.</p>

      <div className="space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Client & Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("Company Name", inp("company", "e.g. Acme Financial Services"))}
            {field("Contact Name", inp("contactName", "e.g. Sarah Chen"))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Workflow</h2>
          <div className="space-y-4">
            {field("Workflow Name", inp("workflow", "e.g. Transaction Fraud Review"), "The name of the specific workflow being governed")}
            {field("Workflow Description", ta("workflow", "Describe what this workflow does, what actions it governs, and why it needs CerbaSeal enforcement..."), "Brief description for the pilot plan document")}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Actors & Approvals</h2>
          <div className="space-y-4">
            {field("Actors (comma-separated)", inp("actors", "e.g. fraud_analyst, risk_system, ai_scorer"), "Who submits requests through the gate")}
            {field("Approver Roles (comma-separated)", inp("approvers", "e.g. senior_analyst, compliance_officer, risk_manager"), "Who can provide human approval artifacts")}
            {field("Approval Trigger", ta("approvalTrigger", "e.g. All fraud_triage requests require human approval. Transactions above €50,000 always require compliance_officer sign-off...", 2), "When is human approval required?")}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Deployment & Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("Deployment Mode", select(form.deployMode, set("deployMode"), [
              ["sandbox", "Sandbox / non-production"],
              ["client-controlled", "Client-controlled environment"],
              ["production-adjacent", "Production-adjacent"],
            ]))}
            {field("Pilot Duration", select(form.duration, set("duration"), [
              ["30", "30 days (Validation)"],
              ["45", "45 days (Controlled)"],
              ["60", "60 days (Standard)"],
              ["90", "90 days (Extended)"],
              ["120", "120 days (Regulated)"],
            ]))}
            {field("Pilot Tier", select(form.tier, set("tier"), [
              ["tier0", "Tier 0 — Discovery (€5k–€15k)"],
              ["tier1", "Tier 1 — Validation (€15k–€35k)"],
              ["tier2", "Tier 2 — Controlled Workflow (€35k–€75k)"],
              ["tier3", "Tier 3 — Regulated Evidence (€75k–€150k)"],
              ["tier4", "Tier 4 — Strategic Anchor (€150k+)"],
            ]))}
            {field("Evidence Level", select(form.evidenceLevel, set("evidenceLevel"), [
              ["basic", "Basic — record of decisions"],
              ["standard", "Standard — governance summary + audit chain"],
              ["formal", "Formal — compliance/legal review"],
              ["regulatory", "Regulatory submission"],
            ]))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Success Criteria (optional)</h2>
          {field("", ta("successCriteria", "One criterion per line. Leave blank to use the standard CerbaSeal pilot success criteria.\n\ne.g.\nAll ALLOW decisions include valid ReleaseAuthorization\nCompliance officer able to generate evidence package independently", 4), "Leave blank for standard criteria")}
        </div>

        <Button onClick={() => setGenerated(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-sm font-semibold">
          <Rocket className="w-4 h-4 mr-2" /> Generate Pilot Plan
        </Button>
      </div>
    </main>
  );
}
