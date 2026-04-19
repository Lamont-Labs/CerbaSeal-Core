# Diagnostic Support Model

## Purpose

This document defines how CerbaSeal support should work during pilot operation.

The goal is to make support deterministic, structured, and low-friction.

## Core principle

All support requests should begin with a diagnostic report.

The diagnostic report exists so that:

- operators can understand what happened
- support receives complete technical context
- repeat back-and-forth is minimized
- the system can explain itself consistently

## Required support packet

Every support request should include:

1. Diagnostic report
2. Request ID
3. Brief note describing expected outcome
4. Timestamp of the event
5. Any client-side workflow context needed to interpret policy intent

## What the diagnostic report contains

The report includes:

- summary of final decision
- primary reason code
- invariant evaluation matrix
- decision path
- replay result
- audit summary
- recommended next action
- raw governed artifacts

## Operator responsibilities

Tier 1 operator responsibilities:

- run or collect the diagnostic report
- confirm whether the issue is expected behavior
- escalate with the full report if needed

## CerbaSeal support responsibilities

Tier 2 support responsibilities:

- interpret invariant behavior
- determine whether current logic is correct
- identify whether policy mapping or workflow assumptions need revision
- provide controlled changes when required

## Why this matters

This support model reduces dependence on ad hoc debugging and preserves a clean boundary between:

- operational handling
- enforcement-layer interpretation
