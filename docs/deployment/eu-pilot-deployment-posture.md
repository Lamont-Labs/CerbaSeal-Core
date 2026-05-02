# CerbaSeal — EU / Pilot Deployment Posture

## Current Demo Status

CerbaSeal is currently hosted as a browser demo on Replit infrastructure at:
https://cerbaseal.replit.app/

This is a demonstration surface only. It is not a client deployment. It is not suitable for
handling real client data or production decisions. It is appropriate for:

- technical review
- enforcement loop demonstration
- reviewer evaluation
- pilot planning discussions

## Preferred Pilot Deployment Models

### Mode A — Embedded library

CerbaSeal is imported directly inside the client service at the decision boundary.

- lowest network surface area
- no separate service to manage
- direct TypeScript/Node.js integration
- requires engineering integration from client or partnership
- suitable for clients with existing Node.js infrastructure

### Mode B — Internal HTTP enforcement service

CerbaSeal runs as an internal enforcement service. The workflow service calls the enforcement endpoint.

- clean separation between workflow logic and enforcement
- independently auditable enforcement layer
- requires internal network controls
- requires internal hosting arrangement
- suitable for clients wanting clear service boundary

### Mode C — Client-controlled pilot environment

A temporary controlled environment operated by the client for the duration of the pilot.

- client controls data residency
- EU-compatible if hosted in EU infrastructure
- requires data processing agreement if applicable
- requires hosting environment review before use
- suitable for initial pilot evaluation where client infrastructure is available

## Data Boundary Assumptions

In all pilot modes:

- client controls workflow data
- client controls deployment environment
- evidence records should remain in client-controlled storage
- CerbaSeal does not require outbound network access
- CerbaSeal does not call external APIs
- CerbaSeal does not connect to external databases
- CerbaSeal does not transmit data to third-party services

## EU / Client-Controlled Infrastructure Posture

For pilots where data residency or EU regulatory posture is a concern:

- Mode C (client-controlled environment) is preferred
- client selects hosting environment and region
- data does not leave the client-controlled environment
- CerbaSeal is deployed as a contained service or library with no external dependencies
- a data processing agreement between parties may be required depending on client jurisdiction
- legal review of data handling is recommended before pilot execution

CerbaSeal itself does not transfer data externally. The deployment model determines data residency.

## What Must Be Reviewed Before Production Use

The following must be addressed before CerbaSeal is used for production decisions:

- client deployment environment security review
- data residency and movement review
- third-party security review of enforcement logic
- legal review of evidence retention requirements
- definition of evidence ownership and liability
- definition of support boundary and escalation path
- version pinning and change management process
- persistent audit storage integration (current implementation is in-memory only)

## What Is Not Acceptable For A Serious Pilot

- unmanaged public demo handling real client data
- undefined data movement between systems
- unclear evidence ownership
- open-ended support without defined scope
- no security review before client data touches the system
- no defined rollback or update process

## Current Limitation Notice

This is a review-ready core demo, not a production client deployment.
The hosted demo at cerbaseal.replit.app is suitable for technical review only.
It must not be used to process real client data or make production decisions.
