---
name: security-review
description: Audits security vulnerabilities, OWASP Top 10 risks, authentication, authorization, CORS, input sanitization, injection, and secrets management.
---

# Security Review

## Scope & Objective
Perform an in-depth security analysis across frontend and backend codebases, identifying vulnerabilities against the OWASP Top 10 and common cloud/web threat vectors.

## Review Checklist
1. **Secrets & Environment Management**:
   - Hardcoded API keys, database connection strings, JWT secrets, or tokens in git history or client bundles.
   - Proper `.env.example` vs `.env` separation and `.gitignore` coverage.
2. **Injection & Sanitization**:
   - NoSQL injection vectors in Mongoose queries (e.g. `$where`, unvalidated `$gt`/`$ne` inputs).
   - XSS prevention in canvas text, user markdown, or dangerously set innerHTML.
3. **Authentication & Authorization**:
   - Route protection, token expiration, secure cookie configuration (`HttpOnly`, `SameSite`, `Secure`).
   - Role-based access control and IDOR (Insecure Direct Object Reference) prevention.
4. **Network & Transport Security**:
   - CORS configuration (avoiding unrestricted `*` origin in production with credentials).
   - Rate limiting on public and mutating endpoints (e.g. `express-rate-limit`).
   - Security headers (Helmet middleware: CSP, HSTS, X-Content-Type-Options).
5. **Dependency Vulnerabilities**:
   - Checking for outdated or compromised npm packages.

## Output Format
- Threat Model & Attack Surface Map
- Vulnerability Findings by Severity (P0 Critical, P1 High, P2 Medium, P3 Low)
- Remediation Code and Config Patches
