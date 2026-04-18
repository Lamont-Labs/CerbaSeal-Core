# Non-Bypassability Model

A security reviewer should assume that a governance system is weak until it proves otherwise.

CerbaSeal is only credible if the answer to the following question is clear:

**What prevents a consequential action from bypassing the governed path?**

## The intended answer in this repository

The intended answer is:

A consequential action is only release-eligible if it successfully passes the execution gate and receives an explicit release authorization.

That means:

- decision envelope alone is not release authorization
- proposal alone is not release authorization
- approval alone is not release authorization
- request validity alone is not release authorization

Release authorization is its own distinct artifact.

## What the current code demonstrates

The current proof surface demonstrates these non-bypassability properties:

### 1. No release authorization on HOLD
If approval is missing where required, the system may still issue a governed decision envelope, but it must not issue release authorization.

### 2. No release authorization on REJECT
If policy, provenance, logging, trust state, control state, or prohibited-use constraints fail, the system must not issue release authorization.

### 3. AI cannot cross into authority-bearing behavior
The proposal boundary is structural. If proposal logic becomes authority-bearing, the request is rejected.

### 4. Blocked states still create governed artifacts
The system does not silently drop failure. It preserves a blocked-action record and governed decision artifact.

## What still remains true even at this phase

This repository is a review package, not a full deployment.

Because of that, non-bypassability is proven here in two forms:

- code structure
- explicit documentation and invariant contract

In a later pilot implementation, this would be reinforced further at integration boundaries and downstream dispatch boundaries.

## Reviewer-facing conclusion

For the current repository phase, the cleanest conclusion is:

There is one governed release path, release authorization is separate from decision proposal and separate from approval artifact, and blocked or held outcomes do not yield downstream release authority.

That is sufficient for this review stage.
