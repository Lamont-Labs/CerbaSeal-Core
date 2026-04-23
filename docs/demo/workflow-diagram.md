# Workflow Diagram

## High-Risk Action Enforcement — Reference Workflow

```
AI Detection
     |
     v
AI Attempt --------> REJECT
     |
     v
Analyst Action
     |
     v
No Approval -------> HOLD
     |
     v
Compliance Approval
     |
     v
Approved Request ---> ALLOW
     |
     v
Execution + Audit
```

---

## Outcome Summary

| Step | Actor | Approval | Result |
|---|---|---|---|
| AI Attempt | AI Detection System | None (AI) | REJECT |
| Analyst Action | Fraud Analyst | Missing | HOLD |
| Approved Request | Fraud Analyst + Compliance Officer | Present and bound | ALLOW |
