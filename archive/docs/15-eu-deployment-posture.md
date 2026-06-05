# EU Deployment Posture

This document does not claim that CerbaSeal is already production-deployed in the EU.

Its purpose is narrower:

to define the deployment posture and pre-pilot design boundary that make CerbaSeal reviewable for EU-facing use.

## Core posture

CerbaSeal should be understood as an enforcement layer that is intended to sit inside client workflows, not as a SaaS destination where client data must necessarily flow into a US-hosted system.

That distinction matters.

A client-controlled or EU-hosted deployment model is materially different from a centralized US-hosted software service processing customer workflow data.

## What this repository currently supports conceptually

This repository is consistent with a sovereignty-compatible deployment posture because:

- decision artifacts are portable
- evidence bundles are exportable
- audit entries are append-only and independently inspectable
- replay does not depend on a hidden external service in this repository
- governed request evaluation is deterministic within the current proof surface

## Questions that must be answered before first pilot

These are pre-pilot design questions, not pre-direction blockers.

### 1. Infrastructure and hosting
Can the CerbaSeal layer run in:
- client-controlled infrastructure
- EU-hosted environment
- controlled managed environment acceptable to the client

### 2. Data processing and legal exposure
What data, if any, leaves the client environment during governed transactions?

What contractual or DPA structure would be required if any vendor-side handling exists?

### 3. Supply-chain auditability
What vendor-facing documentation can Lamont Labs provide so a client can explain CerbaSeal within its own procurement and NIS2 vendor-risk context?

### 4. Legal and operational presence
Does a later EU deployment model require a different legal or commercial structure to satisfy procurement, contracting, or credibility requirements?

## What this repository does NOT claim yet

This repository does not claim:
- final EU hosting architecture
- final GDPR position for a named client
- final DPA language
- final vendor assurance package
- final EU legal-entity structure

## Why this document exists

A reviewer should leave this repository with the correct conclusion:

CerbaSeal has been architected in a way that is compatible with a client-controlled or EU-hosted deployment posture in principle, but the exact deployment, legal, and contractual design belongs to pilot scoping rather than this pre-pilot review package.
