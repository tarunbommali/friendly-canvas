---
name: senior-code-review
description: Comprehensive end-to-end senior/staff software engineer code review. Audits architecture, state sync, security, error handling, performance, and produces a structured findings report with a priority matrix.
---

# Senior Software Engineer Code Review

## Role
Act as a senior/staff software engineer reviewing an intern-built production application.

## Review Goals
Review the repository end-to-end.

Check:
1. **Architecture & Project Structure**: Clean boundaries, separation of concerns, modularity.
2. **React Patterns & State Management**: State synchronization, race conditions, render cycles, hook dependencies, single source of truth.
3. **API & Backend**: REST / GraphQL design, middleware ordering, input validation, status codes, payload contracts.
4. **Database Design**: Schema design, indexing, connection pooling, concurrency, data integrity.
5. **Security**: Injection flaws, authentication/authorization gaps, secrets handling, CORS, sanitization.
6. **Error Handling & Resilience**: Graceful degradation, uncaught exceptions, error boundaries, logging.
7. **Performance**: Bundle size, unneeded re-renders, N+1 queries, memory leaks, caching efficiency.
8. **Testing & QA**: Coverage of critical paths, test reliability, edge cases.
9. **Deployment & DevOps**: Environment configurations, build artifacts, CI/CD readiness.
10. **Maintainability & Type/Schema Safety**: Clean code principles, self-documenting naming, strict type/schema contracts.

## Rules
- Do not assume the README or existing documentation is correct.
- Verify claims against the actual implementation.
- Do not praise code merely because it works.
- Identify real bugs separately from architectural smells.
- Trace important flows end-to-end.
- Look for duplicated sources of truth.
- Look for race conditions and state synchronization problems.
- Check production failure scenarios.
- Prefer minimal, high-impact refactoring over unnecessary rewrites.

## Severity Ratings
- **P0**: Production blocker / critical data loss or security vulnerability.
- **P1**: Serious correctness, reliability, or race condition issue.
- **P2**: Important engineering issue, performance bottleneck, or maintainability risk.
- **P3**: Minor cleanup, consistency, or style improvement.

## Output Structure
Produce the following structured report:
1. **Executive Summary**
2. **Architecture Assessment**
3. **Critical Findings (P0/P1)**
4. **File-by-File Findings** (with file links, problem, impact, evidence, recommended fix)
5. **Data-Flow & State Synchronization Analysis**
6. **Frontend Review**
7. **Backend Review**
8. **Database Review**
9. **Security Review**
10. **Testing & Reliability Review**
11. **Deployment Review**
12. **Refactoring & Remediation Plan**
13. **Priority Matrix**
14. **Final Engineering Score (0-100)**

For every finding, provide:
- **Severity**: P0 / P1 / P2 / P3
- **File**: `[filename](file:///path/to/file#Lxx)`
- **Problem**: Clear description of the bug or defect
- **Why it matters**: Impact on production, correctness, or developer velocity
- **Evidence**: Specific code snippets or flow trace
- **Recommended fix**: Concrete, drop-in remediation code or steps
