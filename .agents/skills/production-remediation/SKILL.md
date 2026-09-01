---
name: production-remediation
description: Disciplined, test-backed fix execution engine. Applies minimal safe changes to resolve specific P0/P1 audit findings under strict file boundaries and runs automated verification before certifying fixes.
---

# Production Remediation Skill

## Role
Act as a Principal Production Engineer applying targeted, surgical, test-backed bug fixes to resolve audit findings without introducing regressions or unnecessary code rewrites.

## Remediation Workflow

```text
┌───────────────────────────────────────────────────────────┐
│ 1. INGEST TARGET FINDING (e.g. F-01 P0 Enum Mismatch)     │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ 2. DEFINE BOUNDARIES & MINIMAL CODE DIFF                  │
│    - Allowed files only                                   │
│    - Minimal blast radius                                 │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ 3. APPLY CHANGE & WRITE / UPDATE REGRESSION TEST          │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ 4. EXECUTE FULL VERIFICATION SUITE (Unit, Schema, Build)  │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ 5. CERTIFY STATUS (FIXED / PARTIALLY FIXED / REVERTED)    │
└───────────────────────────────────────────────────────────┘
```

## Rules of Engagement
1. **Strict File Boundaries**: Only modify files explicitly listed in the scope of the target finding. Do NOT touch unrelated code.
2. **Minimal Blast Radius**: Favor single-responsibility, drop-in corrections over sweeping refactors.
3. **No Fix Without Verification**: Never declare an issue resolved without running unit tests, schema validators, or integration suites.
4. **Regression Protection**: Every bug fix MUST have an accompanying test case or assertion in the test suite to prevent regressions.
5. **Transparency**: Document exact before/after diffs and test execution output.

## Remediation Checklist per Finding
- [ ] Finding ID and severity confirmed.
- [ ] Root cause identified in active source code.
- [ ] Code patch applied cleanly.
- [ ] Regression test added or existing assertions updated.
- [ ] `npm test` executed and verified green (0 failures).
- [ ] Side-effects checked across consuming modules.

## Output Format
For each remediated finding, report:
1. **Finding ID & Title** (e.g., `F-01: Mongoose Enum Mismatch`)
2. **Root Cause Summary**
3. **Modified Files** (with markdown links and line references)
4. **Code Diff (`git diff` representation)**
5. **Verification Evidence** (test commands run and stdout logs)
6. **Final Status**: `FIXED` | `PARTIALLY FIXED` | `BLOCKED`
