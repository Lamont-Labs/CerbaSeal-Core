# CerbaSeal — EU AI Act / NIS2 Mapping Support Pack

**Audience:** Line Axia (advisory use in client conversations)  
**Purpose:** Help Line Axia explain where CerbaSeal supports governance evidence in the context of EU AI Act and NIS2 requirements.  
**Version:** 0.1.0

---

## Critical Framing — Read First

**CerbaSeal does not certify compliance with any regulation.**

This document exists to help Line Axia articulate what CerbaSeal contributes to a client's compliance posture — not to claim that deploying CerbaSeal satisfies any legal obligation.

Every statement in this document uses careful language:
- **"supports"** — CerbaSeal helps make this possible
- **"contributes to"** — CerbaSeal is one relevant component
- **"helps evidence"** — CerbaSeal produces records that are relevant to demonstrating this
- **"does not certify"** — CerbaSeal is not a regulator, auditor, or certification body
- **"requires legal/regulatory review"** — final compliance determination is a legal and regulatory matter

The client remains responsible for their compliance obligations. Line Axia provides advisory interpretation of evidence. Lamont Labs provides the enforcement primitive. None of these replace legal counsel or regulatory engagement.

---

## EU AI Act — Relevant Provisions

The EU AI Act imposes obligations primarily on providers and deployers of high-risk AI systems (Annex III) and general-purpose AI models. The provisions most relevant to CerbaSeal's function are:

---

### Article 9 — Risk Management System

**What the Article requires (simplified):**  
High-risk AI system deployers must establish, implement, document, and maintain a risk management system throughout the lifecycle of the AI system.

**Where CerbaSeal contributes:**  
CerbaSeal enforces a structural control point in the AI decision-action chain. The enforcement gate, its invariant rules, and the evidence it produces contribute to the risk management system by:
- Providing a documented enforcement boundary between AI proposals and actions
- Producing verifiable records of every governance decision
- Enabling replay and audit of governance outcomes over time

**What CerbaSeal does not provide:**  
CerbaSeal is one enforcement component. A complete risk management system requires broader organizational, technical, and legal components that CerbaSeal does not cover.

**Language for client conversations:**  
*"CerbaSeal supports your risk management documentation by providing a verifiable enforcement record at the AI decision point. It does not constitute a risk management system on its own."*

---

### Article 12 — Record-Keeping

**What the Article requires (simplified):**  
High-risk AI systems must automatically log events over their lifetime, to the extent necessary to enable the system to be audited. Logs must be retained for a period appropriate to the system's purpose.

**Where CerbaSeal contributes:**  
CerbaSeal produces an append-only, SHA-256 hash-chained audit log for every enforcement evaluation. The log:
- Records every ALLOW, HOLD, and REJECT outcome
- Is tamper-evident (chain integrity verifiable with `pnpm verify:proof`)
- Includes request identifiers, timestamps, outcome type, and invariant trace
- Persists across process restarts when file-backed logging is enabled
- Can be exported and retained by the client

**What CerbaSeal does not provide:**  
- Automatic log rotation, encryption, or offsite backup
- Logging of the AI model's internal decision process (CerbaSeal governs the action decision, not the model's reasoning)
- Predefined retention periods (these must be agreed per client context)
- Regulatory-format log output (standard JSONL format; client or Line Axia may need to transform for specific regulator requirements)

**Language for client conversations:**  
*"CerbaSeal helps evidence Article 12 record-keeping requirements by producing a tamper-evident, hash-chained audit log of every AI governance decision. Retention period, format compliance, and regulatory interpretation require your legal team."*

---

### Article 14 — Human Oversight

**What the Article requires (simplified):**  
High-risk AI systems must be designed and developed in a way that allows natural persons to effectively oversee their operation. Deployers must implement appropriate human oversight measures.

**Where CerbaSeal contributes:**  
This is the most direct alignment between CerbaSeal's design and the EU AI Act. CerbaSeal enforces human oversight structurally:

1. **Non-self-authorization invariant:** An AI system cannot authorize its own proposals. This is a hard invariant — it cannot be bypassed by any flag or configuration. Human authorization is required.
2. **HOLD mechanism:** When approval is required and not present, the action does not proceed. The workflow pauses until a human provides explicit authorization.
3. **Authority class enforcement:** The human approver must hold a recognized authority class. Authorization by an unknown or invalid authority class produces REJECT.
4. **Evidence of oversight:** The approval artifact (approver identity, timestamp, authority class) is recorded in the evidence bundle for every authorized action.

**What CerbaSeal does not provide:**  
- It does not verify the identity of the approver independently (identity is caller-declared)
- It does not evaluate whether the human's oversight decision was appropriate
- It does not monitor human oversight quality or fatigue
- It does not manage the approval workflow (notifications, escalations, deadlines)

**Language for client conversations:**  
*"CerbaSeal contributes to Article 14 human oversight requirements by structurally enforcing that AI systems cannot authorize their own proposals. Every authorized action requires a human-issued approval that passes through the enforcement gate. This contributes to oversight evidence. Whether your oversight implementation satisfies Article 14 fully requires regulatory and legal review."*

---

### Article 13 — Transparency and Provision of Information

**What the Article requires (simplified):**  
High-risk AI systems must be designed and developed in a way that their operation is sufficiently transparent to deployers.

**Where CerbaSeal contributes:**  
CerbaSeal's enforcement decisions are deterministic and replayable. The reason code attached to every REJECT and HOLD explains exactly which invariant failed and why. This supports:
- Understanding why an AI action was blocked
- Auditing the governance logic applied to specific decisions
- Explaining governance outcomes to internal reviewers and auditors

**What CerbaSeal does not provide:**  
- Explanation of the AI model's internal reasoning or confidence
- User-facing transparency interfaces (the evidence is machine-readable; human-readable interpretation requires Line Axia's advisory layer)

---

### Article 17 — Quality Management System

**What the Article requires (simplified):**  
Providers of high-risk AI systems must put in place a quality management system to ensure compliance with the Regulation.

**Where CerbaSeal contributes:**  
CerbaSeal's self-auditing infrastructure (15/15 audit checks, 391 tests, proof snapshot with stable checksum) supports quality management documentation by:
- Providing verifiable evidence that the enforcement system is in a known state
- Enabling testing of enforcement behavior against defined scenarios
- Supporting version control and change management for the enforcement core

**What CerbaSeal does not provide:**  
A complete quality management system. This is an organizational and process requirement; CerbaSeal is one technical component.

---

## NIS2 Directive — Relevant Provisions

NIS2 applies to essential and important entities across a broad range of sectors. The provisions most relevant to CerbaSeal's function are in Articles 21 and 23.

---

### Article 21 — Cybersecurity Risk Management

**What the Article requires (simplified):**  
Entities must take appropriate and proportionate technical, operational, and organisational measures to manage cybersecurity risks. This includes measures relating to supply chain security and access control.

**Where CerbaSeal contributes:**

**Supply chain relevance:**  
CerbaSeal operates with zero external runtime dependencies. The enforcement core makes no outbound API calls, has no cloud service dependencies, and runs entirely on client-controlled infrastructure. This reduces supply chain risk exposure at the enforcement decision point.

**Access control relevance:**  
CerbaSeal's authority class enforcement ensures that only recognized human authority classes can produce an authorized ALLOW outcome. Unrecognized or malformed authority claims produce REJECT. This contributes to access control at the AI-action boundary.

**Audit trail relevance:**  
The hash-chained audit log supports incident investigation and forensic review of AI governance decisions if a security incident occurs.

**What CerbaSeal does not provide:**  
- Network access controls (these are client infrastructure responsibilities)
- Identity and access management for the calling system
- Vulnerability management for the deployment environment
- A full NIS2 cybersecurity risk management program

**Language for client conversations:**  
*"CerbaSeal contributes to NIS2 supply chain risk management by operating without external runtime dependencies — the enforcement decision does not rely on any third-party service. Its audit trail supports forensic review. A complete NIS2 compliance program requires broader organizational and technical measures."*

---

### Article 23 — Reporting Obligations

**What the Article requires (simplified):**  
Entities must report significant incidents to relevant authorities. Incident reports must include details of the incident's impact.

**Where CerbaSeal contributes:**  
If an AI governance failure constitutes or contributes to a significant incident, CerbaSeal's audit log supports incident reporting by providing:
- A complete chronological record of enforcement decisions around the incident timeframe
- Verifiable evidence of what was authorized, held, or rejected
- Replay capability to reconstruct decision sequences

**What CerbaSeal does not provide:**  
- Incident detection or alerting
- Automated incident reporting
- Regulatory reporting format output

---

## Data Act — General Relevance

The Data Act imposes obligations around data access, sharing, and portability. CerbaSeal's relevance is limited but worth noting:

**Where CerbaSeal contributes:**  
- The audit log contains governance metadata — not personal data from the governed workflow (unless the caller includes personal data in the request object)
- Client-controlled deployment ensures governance data stays within the client's data perimeter
- The JSON Lines audit format is machine-readable and portable

**What clients must manage:**  
- If the GovernedRequest objects contain personal data, data subject rights apply to those records
- Clients should design their request objects to minimize personal data inclusion where possible
- Data processing agreements between client, Line Axia, and Lamont Labs govern data handling

---

## What CerbaSeal Helps Evidence — Summary Table

| Requirement Area | CerbaSeal Contribution | What It Does Not Cover |
|---|---|---|
| Human oversight (Art. 14) | Structural enforcement that AI cannot self-authorize; HOLD until human approval present; approval artifact recorded | Approver identity verification; oversight quality |
| Record-keeping (Art. 12) | Hash-chained, tamper-evident audit log; every decision recorded | Retention format compliance; AI model logging |
| Risk management documentation (Art. 9) | Verifiable enforcement boundary; audit trail; replay capability | Full risk management system |
| Transparency (Art. 13) | Deterministic, replayable decisions; reason codes on all outcomes | Model explainability; user-facing interfaces |
| Supply chain risk (NIS2 Art. 21) | Zero runtime dependencies; client-controlled deployment | Network security; IAM; full supply chain audit |
| Incident investigation (NIS2 Art. 23) | Audit log supports forensic reconstruction | Incident detection; regulatory reporting |

---

## How Line Axia's Advisory Layer Interprets Outputs

CerbaSeal produces governance evidence. Line Axia's advisory role is to interpret that evidence in the client's regulatory and operational context.

**What Line Axia does:**
- Reviews audit log outputs and evidence bundles with the client
- Maps evidence to specific regulatory provisions using this document
- Advises the client on what the evidence demonstrates and what it does not
- Helps the client present evidence to internal audit, external auditors, or regulators
- Identifies gaps between CerbaSeal's output and the client's compliance requirements

**What Line Axia does not do:**
- Provide legal advice (that requires a qualified lawyer)
- Certify regulatory compliance (that requires a regulator or accredited auditor)
- Interpret regulations definitively (regulatory interpretation is a legal matter)

---

## How Client Responsibility Is Maintained

The client is always the responsible party for their compliance obligations.

**Deploying CerbaSeal does not transfer compliance responsibility to Lamont Labs or Line Axia.**

| Client Responsibility | Why It Remains with the Client |
|---|---|
| AI Act conformity assessment | The deployer is responsible for conformity, not the tool provider |
| Data protection obligations | Client is the data controller for their workflow data |
| Staff training on oversight | CerbaSeal enforces structure; humans must be trained to use it |
| Regulatory engagement | Communication with regulators is the client's responsibility |
| Legal interpretation | CerbaSeal produces evidence; what it proves legally requires a lawyer |

---

## Standard Disclaimer for All Client Communications

Use this text (or a version of it) whenever presenting CerbaSeal in a compliance context:

> "CerbaSeal produces structured governance evidence and enforces human authorization controls at the AI decision boundary. It supports compliance readiness by providing a tamper-evident audit trail and structural enforcement of human oversight requirements. CerbaSeal does not certify compliance with the EU AI Act, GDPR, NIS2, or any other regulation. Compliance determination requires legal and regulatory review by qualified professionals. Clients remain responsible for their compliance obligations."
