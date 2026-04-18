# Runtime Layer Stack

CerbaSeal is defined as a bounded enforcement architecture rather than a monolith.

No single layer should silently complete the full workflow on its own.

The layer stack below is the runtime logic reviewers should evaluate.

---

## 1. Input Layer

### Purpose
Prevent uncontrolled or underspecified requests from entering the governed path.

### Responsibilities
- schema validation
- identity and role binding
- source and artifact reference validation
- jurisdiction and workflow binding

### Always-true conditions
- requests must arrive in a structured envelope
- unknown fields are not accepted
- request identity context must exist
- workflow class must be known before evaluation continues

### Failure response
- reject malformed request
- reject undeclared or unknown structure
- reject request with missing required source references

---

## 2. Decision Layer

### Purpose
Evaluate the proposed action without granting execution authority.

### Responsibilities
- deterministic rule evaluation
- constrained AI proposal handling
- action-class validation
- risk-threshold evaluation
- human-review requirement determination
- decision trace construction

### Always-true conditions
- proposal logic may exist here
- execution authority may not exist here
- AI contribution remains proposal-level only
- requested action remains within bounded action vocabulary

### Failure response
- reject invalid proposal
- reject out-of-bounds action
- hold if human authority is required and not yet present

---

## 3. Execution Layer

### Purpose
Make the final release decision.

### Responsibilities
- enforce authority-state checks
- verify approval artifacts where required
- ensure release occurs only from a valid governed state
- issue immutable decision envelope
- issue release authorization only on valid allow state

### Always-true conditions
- no release without required policy
- no release without required provenance
- no release without required approval
- no release without trust-state validity
- no release when critical controls are stale or invalid
- no release without logging precondition

### Failure response
- hold or reject
- do not emit release authorization
- emit blocked action record

---

## 4. Audit Layer

### Purpose
Ensure every consequential transition leaves behind preserved evidence.

### Responsibilities
- append-only event chain
- event hashing and linkage
- evidence bundle creation
- export manifest creation
- replay material preservation

### Always-true conditions
- success is auditable
- failure is auditable
- event history is append-only
- export references source evidence rather than mutating it

### Failure response
- if audit preconditions fail, governed action must not proceed
- audit-chain inconsistency invalidates trust in recorded history

---

## 5. Enforcement Layer

### Purpose
Provide the global runtime behavior that governs all other layers.

### Responsibilities
- enforce fail-closed behavior
- stop requests that cannot be structurally validated
- stop requests that cannot be authority-validated
- stop requests that cannot be source-validated
- stop requests that cannot be evidence-complete

### Always-true conditions
- malformed input must not degrade into execution
- unverifiable source state must not degrade into execution
- missing authority must not degrade into execution
- prohibited use must not degrade into execution
- incomplete evidence preconditions must not degrade into execution

### Failure response
- reject
- or hold
- but never silently proceed

---

## Layer interaction rule

The system should be read as:

Input → Decision → Execution → Audit

with the Enforcement Layer acting as the global fail-closed behavior spanning all four.

That is the core runtime shape a reviewer should keep in mind when reading the code and docs in this repository.
