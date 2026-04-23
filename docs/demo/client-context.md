# Aurelion Bank — Client Context

## Overview

Aurelion Bank is an EU-based fintech that processes cross-border transactions. It uses AI models to detect fraud patterns and assist human analysts in reviewing flagged activity.

## Regulatory Context

Aurelion Bank operates under regulatory requirements that prohibit executing any high-risk action — such as account restriction or transaction escalation — without:

- Verified human authority
- A complete audit trace
- An immutable decision record

These requirements are not met by policy statements alone. They must be enforced structurally at runtime.

## Where CerbaSeal Sits

CerbaSeal is placed between:

- Decision-making systems (AI detection and analyst review)
- Execution systems (account actions and escalation pipelines)

No action reaches execution without passing through CerbaSeal's enforcement gate.

## Actor Roles

**AI Detection System**  
Identifies suspicious activity and generates proposals. Proposals are non-authoritative — the AI cannot approve or authorize its own outputs.

**Fraud Analyst**  
Reviews flagged cases and proposes operational actions such as account holds. Analysts can submit requests but cannot self-approve sensitive actions.

**Compliance Officer**  
Reviews cases requiring elevated authority and issues approvals. Approvals are bound to specific requests and include authority classification. The compliance officer is the sole actor who can satisfy the approval requirement for sensitive actions.
