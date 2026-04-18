# Pilot Boundary and Client Binding

This document exists to preserve the line between:

- what is reviewable now
- what must wait for paid pilot scope

That distinction is strategically important.

## Reviewable now

The following are reviewable now in this repository:

- system framing
- runtime layer stack
- invariant model
- execution gate behavior
- authority boundary
- blocked-action semantics
- append-only audit behavior
- evidence bundle model
- export manifest model
- replay model
- EU deployment posture at principle level

## Must wait for paid pilot

The following must wait for paid pilot scoping:

- actual client workflow binding
- customer-specific action taxonomy
- customer-specific policy pack encoding
- real system integrations
- real production hosting topology
- real data-flow and DPA mapping
- real authority-role mapping to the client organization
- deployment hardening and operational runbooks

## Why this line matters

If this line is not maintained, CerbaSeal risks becoming unpaid pilot work disguised as review preparation.

The correct pre-pilot objective is narrower:

prove the enforcement architecture is real and reviewable.

## Practical use of this document

If a reviewer or partner asks why something is not present in the repository, the answer should be:

Because it depends on named client context and belongs to pilot scoping, not pre-pilot proof of architectural legitimacy.
