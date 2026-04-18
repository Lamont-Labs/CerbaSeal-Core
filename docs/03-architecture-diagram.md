# Architecture Overview

## High-Level Flow

Request → Execution Gate → Decision Envelope → Audit Chain → Evidence Bundle → Export / Replay

## Layered View

[Input Layer]
    ↓
[Decision Layer]
    ↓
[Execution Gate] ← (authority enforcement)
    ↓
[Audit Layer] ← (append-only log)
    ↓
[Evidence Bundle]
    ↓
[Export Manifest / Replay]

## Key Properties

- Single enforcement point (Execution Gate)
- No release without explicit authorization
- All outcomes produce governed artifacts
- Audit chain is append-only and hash-linked
- Evidence is exportable and replayable

## Critical Constraint

There is no valid path to execution that does not pass through the Execution Gate.
