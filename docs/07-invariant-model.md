# Invariant Model

This repository is organized around invariants rather than feature claims.

That is deliberate.

CerbaSeal should be reviewed as a system that first defines what cannot break, then builds enforcement around those conditions.

## Core invariants in this repository

### INV-01 — No policy pack, no execution
A governed action must not proceed if policy context does not exist.

### INV-02 — No provenance, no action
A governed action must not proceed if the source logic or model/rule lineage cannot be identified.

### INV-03 — No required approval, no release
If accountable human approval is required, release must not occur until valid approval exists.

### INV-04 — No logging, no execution
If the audit path is not ready, consequential execution must not proceed.

### INV-05 — AI is non-authoritative
AI may propose. AI may not authorize.

### INV-06 — No bypass of execution gate
Consequential action must route through the governed release path.

### INV-07 — Decision envelope is immutable
A governed decision artifact must be treated as immutable once issued.

### INV-08 — Stale controls block sensitive release
Critical stale or invalid controls invalidate release eligibility for sensitive workflows.

### INV-09 — Trust state required
Invalid trust state blocks release.

### INV-10 — Prohibited use must block
Requests classified as prohibited must fail closed.

### INV-11 — Request schema and action class must be valid
Malformed or out-of-bounds requests must fail before release logic.

### INV-12 — Proposal and request action must match
The proposal path cannot silently drift from the declared governed request.

## Why invariants matter more than features

A reviewer does not need to see a broad product to take CerbaSeal seriously.

A reviewer needs to see that:
- invariants are explicit
- invariants are enforced
- failures are deterministic
- invalid states do not degrade into execution

## Current implementation boundary

In this repo, invariants are expressed in:
- documentation
- invariant registry
- execution gate behavior
- tests

That is enough for this phase because the objective is architectural reviewability, not full platform breadth.
