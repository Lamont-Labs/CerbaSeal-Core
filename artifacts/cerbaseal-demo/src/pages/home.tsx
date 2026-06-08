import { Link } from "wouter";
import { Shield, ClipboardCheck, Rocket, Wrench, BookOpen, Users, Wand2, ArrowRight, CheckCircle, Clock, TrendingDown } from "lucide-react";

const tools = [
  {
    href: "/assess",
    icon: ClipboardCheck,
    color: "text-blue-400",
    bg: "bg-blue-950",
    border: "border-blue-800",
    title: "Readiness Assessment",
    desc: "Answer 16 questions about your environment, team, workflow, and compliance needs. Get an instant READY / READY WITH SUPPORT / NOT READY verdict plus a precise onboarding hour estimate.",
    cta: "Run assessment →",
    time: "8 min",
  },
  {
    href: "/pilot",
    icon: Rocket,
    color: "text-emerald-400",
    bg: "bg-emerald-950",
    border: "border-emerald-800",
    title: "Pilot Generator",
    desc: "Enter your company, workflow, actors, approvals, and timeline. Get a complete pilot plan — scope, success criteria, deployment checklist, support plan, and evidence requirements — ready to share.",
    cta: "Generate pilot plan →",
    time: "5 min",
  },
  {
    href: "/troubleshoot",
    icon: Wrench,
    color: "text-amber-400",
    bg: "bg-amber-950",
    border: "border-amber-800",
    title: "Troubleshooter",
    desc: "Something isn't working. Walk through a guided diagnostic. The troubleshooter identifies the probable cause and resolution path for the most common deployment and runtime issues — before you contact support.",
    cta: "Start diagnostic →",
    time: "3 min",
  },
  {
    href: "/training",
    icon: BookOpen,
    color: "text-purple-400",
    bg: "bg-purple-950",
    border: "border-purple-800",
    title: "Training Center",
    desc: "Four tracks: Executive (10 min), Operator (30 min), Admin (30 min), Developer (self-paced). Each module has clear objectives and structured topics. Start where you need to start.",
    cta: "Go to training →",
    time: "Self-paced",
  },
  {
    href: "/partner",
    icon: Users,
    color: "text-rose-400",
    bg: "bg-rose-950",
    border: "border-rose-800",
    title: "Partner Enablement Kit",
    desc: "Everything a consulting partner needs to deliver CerbaSeal pilots independently. Includes the channel model, certification path, deployment resources, support boundaries, and pricing structure.",
    cta: "Open partner kit →",
    time: "Reference",
  },
  {
    href: "/wizard",
    icon: Wand2,
    color: "text-violet-400",
    bg: "bg-violet-950",
    border: "border-violet-800",
    title: "Workflow Mapping Wizard",
    desc: "Map your workflow to CerbaSeal in 6 guided steps. Define actions, AI role, human approvers, and deployment mode — then download a ready-to-deploy configuration package. No founder involvement required.",
    cta: "Start wizard →",
    time: "30–60 min",
  },
];

const metrics = [
  { icon: CheckCircle, color: "text-emerald-400", label: "Evidence generation", value: "READY", sub: "Fully automated · zero founder involvement" },
  { icon: Clock, color: "text-amber-400", label: "Founder hours / pilot", value: "15–29h", sub: "Current per pilot (audit Jun 2026) · Target: 3–8h" },
  { icon: TrendingDown, color: "text-blue-400", label: "Client adoption score", value: "55/100", sub: "Audit Jun 2026 · Configure 28/100 is the gap · Target: 80/100" },
];

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Client Success Center</h1>
            <p className="text-slate-400 text-sm mt-0.5">CerbaSeal v0.1.0 · Lamont Labs · Commercialization Infrastructure</p>
          </div>
        </div>
        <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
          The enforcement core is solved. The commercial question is adoption:{" "}
          <span className="text-white font-medium">can someone deploy, learn, operate, and support CerbaSeal without the founder?</span>{" "}
          Every tool on this page moves that answer closer to yes.
        </p>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-slate-400 text-xs">{m.label}</span>
            </div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-slate-500 text-xs mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <div className={`${tool.bg} border ${tool.border} rounded-xl p-6 h-full cursor-pointer hover:scale-[1.01] transition-transform group`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-950/50`}>
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <span className="text-slate-500 text-xs bg-slate-900 px-2 py-1 rounded">{tool.time}</span>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">{tool.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{tool.desc}</p>
              <div className={`flex items-center gap-1 text-sm font-medium ${tool.color} group-hover:gap-2 transition-all`}>
                {tool.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Key insight */}
      <div className="mt-10 bg-slate-900 border border-blue-900 rounded-xl p-6">
        <div className="text-blue-400 text-xs font-bold mb-2 tracking-wide">KEY COMMERCIAL INSIGHT</div>
        <blockquote className="text-white text-base font-medium mb-2">
          "The actual tool itself is honestly the thing I'm least concerned about. I'm concerned about support, onboarding, operationalization, and deployment."
        </blockquote>
        <p className="text-slate-400 text-sm">
          Technical credibility gate: passed. The question is now delivery confidence. Reducing founder hours per pilot from 15–29 → 3–8 with the same product, same gate, same invariants — multiplies revenue capacity 4–5×. That's why this center exists.
        </p>
      </div>
    </main>
  );
}
