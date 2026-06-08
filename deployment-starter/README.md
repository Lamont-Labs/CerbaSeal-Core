# CerbaSeal — Deployment Starter

A minimal, self-contained deployment template. Follow the 5 steps below to go from zero to a running, verified enforcement gate.

---

## Prerequisites

- Node.js 18 or higher
- pnpm installed (`npm install -g pnpm`)
- CerbaSeal-Core source (this repo)

> **Dependency model:** `deployment-starter/package.json` declares `"cerbaseal-review": "file:../"` — a file reference to the CerbaSeal-Core root package. This is the standard pre-npm-publish package reference. Running `pnpm install` inside `deployment-starter/` creates a `node_modules/cerbaseal-review` symlink pointing to the repo root, which is what the import statements resolve through. When CerbaSeal is published to npm (future), the reference changes from `file:../` to the npm package name — no other code changes required.

---

## 5-Step Setup

### Step 1 — Clone and install

```bash
git clone <cerbaseal-core-repo-url>
cd cerbaseal-core
pnpm install
```

Verify the installation:

```bash
pnpm test
# Expected: 419/419 tests passing

pnpm audit:repo
# Expected: 16/16 checks passing
```

---

### Step 2 — Run the setup wizard

```bash
pnpm setup
```

The wizard asks 6 questions:
1. Deployment mode (A/B/C)
2. Workflow name (→ becomes the workflow class identifier)
3. AI actor identifier
4. Number of approver roles (1–3) and their authority classes
5. Audit log storage path (file or in-memory)
6. Environment (dev/staging/production)

At the end, it writes `cerbaseal.config.json` and `cerbaseal.policy.json` to the repo root, then runs `pnpm audit:repo` automatically.

**What a successful setup looks like:**
```
✓ Setup complete — CerbaSeal is configured and all 16 audit checks pass.
```

---

### Step 3 — Review the generated config files

Open `cerbaseal.config.json` and `cerbaseal.policy.json` at the repo root.

Confirm:
- Your workflow class appears under `workflowClasses.extended`
- Your approver roles appear under `actorMappings`
- Your approval chains are correct under `approvalChains`

Edit either file if any values need adjustment, then re-run `pnpm audit:repo`.

---

### Step 4 — Run the audit to confirm

```bash
pnpm audit:repo
```

**What a passing result looks like:**
```
16 / 16 checks passed
Status: PASS
```

If any check fails, the output names the check and the reason. Fix the issue and re-run.

---

### Step 5 — Run verification scenarios

```bash
tsx deployment-starter/verify.ts
```

This runs 3 scenarios against the live gate:

1. **REJECT** — AI actor attempts self-authorization → must be rejected
2. **HOLD** — Request submitted without approval → must be held
3. **ALLOW** — Request with valid approval → must be allowed

**What a passing result looks like:**
```
Scenario 1: REJECT — AI actor cannot self-authorize
  [PASS] finalState is REJECT
  [PASS] releaseAuthorization is null
  [PASS] blockedActionRecord is present

Scenario 2: HOLD — approval required but not supplied
  [PASS] finalState is HOLD
  [PASS] humanApprovalRequired is true
  [PASS] releaseAuthorization is null

Scenario 3: ALLOW — valid request with analyst approval
  [PASS] finalState is ALLOW
  [PASS] releaseAuthorization is present
  [PASS] humanApprovalPresent is true

Results: 9 passed, 0 failed
✓ All 3 scenarios passed. Deployment verified.
```

When all 3 scenarios show `[PASS]`, your deployment is verified and ready for integration.

---

## Files in this directory

| File | Purpose |
|---|---|
| `README.md` | This guide |
| `index.ts` | Minimal integration entry point — shows how to construct and evaluate a request |
| `cerbaseal.config.json` | Configuration template — copy to repo root and edit |
| `cerbaseal.policy.json` | Policy template — copy to repo root and edit |
| `package.json` | Minimal dependencies only |
| `verify.ts` | Standalone verification script |

---

## Need help?

- Full operator guide: `docs/deployment/quickstart-operator-guide.md`
- Troubleshooting: `docs/client-adoption/troubleshooting-guide.md`
- Policy authoring: `docs/client-adoption/policy-pack-authoring-guide.md`
- Training: `docs/client-adoption/training/admin-guide.md`
