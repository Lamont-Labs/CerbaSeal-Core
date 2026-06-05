# Architecture Overview

## High-Level Flow

Request → Execution Gate → Decision → Audit → Evidence Bundle → Export / Replay

There is no valid execution path outside this flow.

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

All consequential actions must pass through the execution gate to obtain release authorization.