# CerbaSeal Pilot Intake Checklist

Use this checklist to determine whether a workflow is suitable for a CerbaSeal pilot.

## 1. Workflow

- What is the workflow name?
- What does the workflow do?
- What starts the workflow?
- What system currently handles it?

## 2. Action Boundary

- What action should be protected?
- What happens if the action executes?
- Is the action reversible?
- Is the action high-impact?

## 3. Actors

- Who or what proposes the action?
- Is the proposer an AI system, rule system, human, or mixed source?
- Who reviews the action?
- Who approves the action?

## 4. Approval Model

- Is approval required?
- When is approval required?
- Who can approve?
- What counts as valid approval?
- Is approval bound to a specific request?

## 5. Evidence

- What needs to be recorded?
- Who will inspect the evidence?
- What format is useful?
- How long should evidence be retained?

## 6. Integration

- Where would CerbaSeal sit?
- What system would call CerbaSeal?
- What system would receive the decision?
- What happens after REJECT?
- What happens after HOLD?
- What happens after ALLOW?

## 7. Constraints

- Can data leave the environment?
- Is local-only evaluation required?
- Are there latency constraints?
- Are there audit constraints?
- Are there legal or security review constraints?

## 8. Pilot Fit

A workflow is a good fit if:

- actions are consequential
- approval matters
- evidence matters
- execution can be gated
- REJECT / HOLD / ALLOW outcomes are meaningful

A workflow is a poor fit if:

- no action is executed
- no approval boundary exists
- evidence is not useful
- outcomes cannot be intercepted
- the goal is to judge whether the action is correct
