# CerbaSeal — Market Category and Positioning

**Audience:** Partner sales leads, partner principals  
**Version:** v0.1.0 | June 2026  
**Classification:** Partner Confidential — Authorized Recipients Only

---

## Positioning Statement

CerbaSeal should be evaluated as **governance enforcement infrastructure**: a deterministic control layer that integrates with existing systems to enforce approval, provenance, logging, trust, and policy requirements before execution.

**In one sentence:** AI and automation can propose actions; CerbaSeal determines whether those actions are authorized to proceed.

CerbaSeal should not be positioned as compliance automation, audit logging, AI monitoring, or workflow software. Those descriptions understate the enforcement function and invite comparison to the wrong category of competitors.

---

## Category Placement

| Category | Why It Matters for CerbaSeal | Representative Examples |
|----------|------------------------------|------------------------|
| Runtime policy enforcement | Closest structural analog: policy is evaluated in the path of execution | Styra / OPA ecosystem, Axiomatics, PlainID, Permit.io |
| AI governance control plane | Comparable buyer concern: auditability, oversight, controls, traceability, and policy outcomes | Credo AI, Arthur AI, Fiddler AI |
| Enterprise middleware | Comparable buying behavior: sits between systems and becomes operationally critical | MuleSoft, Workato, Boomi, Tines |
| Decision governance | Comparable workflow context: risk decisions, fraud decisions, transaction actions, approval chains | FICO Decision Management, Pega Decisioning, Actimize, Feedzai |

**CerbaSeal is not a monitoring tool, compliance logger, or workflow engine.** The strongest differentiation is enforcement: the system does not observe what happens after a decision — it determines whether execution is authorized before it occurs.

---

## Buyer-Relevant Outcomes

| Outcome | What CerbaSeal Contributes |
|---------|---------------------------|
| Operational clarity | Every request returns ALLOW, HOLD, or REJECT with reason codes and checked governance controls |
| Audit readiness | Evidence bundles and audit-chain verification support internal review, pilot evidence packages, and governance analysis |
| Human oversight | AI proposals remain non-authoritative and must satisfy approval and policy requirements before execution |
| Deployment control | The system runs in customer-controlled environments using Docker Compose or direct Node.js paths |
| Partner scalability | A guided delivery framework enables partners to qualify, deploy, configure, verify, and hand over pilots with defined escalation boundaries |

---

## Buyer Profile

The strongest near-term buyer profile is a regulated or control-sensitive organization with one narrow workflow where approval, traceability, and evidence matter. Examples:

- Fraud triage
- Transaction escalation
- Account hold recommendation
- KYC escalation
- Insurance claim review
- AI agent tool execution in regulated contexts

The economic buyer is typically the **CRO or CISO**. The technical buyer is the **Engineering Lead or Head of Platform**. The champion is usually the person closest to a recent incident or incoming regulatory deadline.

---

## Buyer Persona Map

| Persona | Pain | Why CerbaSeal |
|---------|------|---------------|
| CISO | AI decisions are creating liability they can't see | CerbaSeal makes every AI-influenced decision an auditable artifact |
| CRO / Head of Risk | Approval processes exist but aren't technically enforced | CerbaSeal is enforcement infrastructure — it cannot be bypassed |
| Head of AI Governance | Needs to demonstrate human oversight to regulators | ALLOW/HOLD/REJECT decisions are cryptographically chained and exportable |
| CTO / Engineering Lead | Wants to deploy AI responsibly without building governance from scratch | CerbaSeal is a library + config file; 30–60 minutes to integration |

---

## Market Evidence and Comparable Benchmarks

Market evidence points to five- and six-figure annual contracts for adjacent infrastructure categories. Exact private enterprise contract values are often not public; the framework below uses evidence tiers.

| Evidence Point | Public Source Evidence | CerbaSeal Implication |
|---------------|----------------------|----------------------|
| **Arthur AI** | AWS Marketplace and Arthur materials position Arthur as continuous evaluations and guardrails for AI, with public marketplace category availability | AI governance infrastructure can be sold through marketplace and enterprise procurement channels |
| **Credo AI** | AWS Marketplace states pricing depends on contract duration, contract terms, and usage | Enterprise AI governance pricing is often private-offer and use-case based |
| **Styra** | AWS Marketplace lists Styra DAS Enterprise at $5,000/month for 16 systems and 100MM decisions/month | Runtime policy enforcement has a concrete ~$60K/year public benchmark |
| **Workato** | AWS Marketplace lists Enterprise workspace with 1,000,000 tasks and Enterprise Support at $143,750/year | Between-systems automation infrastructure supports six-figure annual pricing |
| **MuleSoft** | AWS Marketplace listings show six-figure annual pricing tiers and services ecosystem | Integration/control-plane products command enterprise budgets when operationally central |
| **Fiddler** | Fiddler describes the AI control plane as standardized telemetry, reliable evaluation, continuous monitoring, enforceable policy, and auditable governance | The market language is moving toward control-plane positioning for AI oversight |

---

## Regulatory Context

Three forces make AI governance enforcement increasingly urgent in 2026:

**1. EU AI Act (2026 enforcement)**
High-risk AI systems must have human oversight mechanisms that are technically enforced, not just procedurally described. A policy document that says "humans review AI decisions" does not satisfy the requirement. A system that makes it technically impossible to proceed without a valid human approval does.

**2. Internal audit pressure**
Risk and compliance teams are asking harder questions about AI accountability. "We have a human in the loop" is not the same as "we can prove a specific named human approved this specific decision before it executed."

**3. Incidents**
The first wave of AI decision-making incidents — incorrect fraud flags, wrongful holds, automated account actions — is creating board-level appetite for governance infrastructure that was previously optional.

**Regulatory reference:** EU AI Act, Article 26 — deployer obligations for high-risk AI systems. URL: artificialintelligenceact.eu/article/26/

---

## Differentiation Points

| Claim | Basis |
|-------|-------|
| Deterministic, not probabilistic | evaluate() is a pure synchronous function — same request always produces same decision |
| Cannot be bypassed by application code | Enforcement is at the infrastructure layer, not inside the AI system or application |
| Produces exportable evidence by design | EvidenceBundle and ExportManifest are first-class outputs, not afterthoughts |
| Customer-controlled deployment | Runs in the client's environment; no data leaves their perimeter |
| Partner-deliverable without founder involvement | Certification framework and guided delivery model designed for this explicitly |

---

## Source Notes

| Source | Evidence Used |
|--------|--------------|
| CerbaSeal-Core v0.1.0 Technical Reference Manual | Internal source: architecture, invariants, configuration, audit/evidence, API, deployment, tests, partner delivery, security |
| AWS Marketplace — Styra Authorization Platform | Public pricing: Styra DAS Enterprise at $5,000/month. URL: aws.amazon.com/marketplace/pp/prodview-4qemlqp6lodwg |
| AWS Marketplace — Workato Enterprise Automation | Public pricing: Enterprise workspace with 1,000,000 tasks and Enterprise Support at $143,750/year. URL: aws.amazon.com/marketplace/pp/prodview-yrn5rvs3n6v4c |
| AWS Marketplace — MuleSoft listings | Evidence of six-figure middleware/integration pricing and professional-services ecosystem. URL: aws.amazon.com/marketplace |
| AWS Marketplace — Credo AI Enterprise AI Governance | Private-offer pricing model based on contract duration, terms, and usage. URL: aws.amazon.com/marketplace/pp/prodview-x67krdatcdday |
| Fiddler AI Control Plane materials | AI control-plane positioning around enforceable policy, auditable governance, and centralized oversight. URL: fiddler.ai/control-plane |
| EU AI Act / Article 26 resources | Regulatory context for human oversight, monitoring, logging, and deployer responsibilities. URL: artificialintelligenceact.eu/article/26/ |
| AWS Marketplace / Forrester partner economics | Channel partner benchmarks: professional-services margins 25%–45%, resale margin ~13%. URL: aws.amazon.com/blogs/apn/a-total-economic-impact-partner-opportunity-analysis-for-channel-partners-selling-in-aws-marketplace/ |

**Important limitation:** Many enterprise AI governance, control-plane, and compliance vendors use private offers or custom pricing. Exact private contract values are often not publicly available. The pricing framework in [08-pricing-and-commercial-model.md](08-pricing-and-commercial-model.md) should be used as a structured discussion model and refined after direct partner feedback, first pilot scoping, and observed support effort.
