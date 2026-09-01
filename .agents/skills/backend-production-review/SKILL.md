---
name: backend-production-review
description: Comprehensive review of backend Express/Node.js architecture, API contracts, Mongoose/database modeling, error handling, rate limiting, and production readiness.
---

# Backend Production Review

## Scope & Objective
Audit backend services, Express routing, database schemas, middleware chains, validation pipelines, and operational readiness for production workloads.

## Review Checklist
1. **API Design & Protocol Hygiene**:
   - Consistent RESTful endpoints, status codes (`200`, `201`, `400`, `404`, `422`, `500`), and response envelopes.
   - Robust input validation (Joi/Zod/express-validator) before hitting business logic.
2. **Database & Schema Modeling**:
   - Mongoose schema constraints, compound indexes, unique index handling.
   - Query efficiency (avoiding full collection scans or unindexed queries).
   - Graceful connection handling, reconnection strategies, and pooling.
3. **Error Handling & Middleware Pipeline**:
   - Centralized async error handling middleware catching rejected promises.
   - Structured JSON error responses avoiding stack trace leak in production (`NODE_ENV === 'production'`).
   - Request timeouts and graceful shutdown hooks (`SIGTERM`/`SIGINT`).
4. **Data Integrity & Concurrency**:
   - Atomic transactions / operations where multiple documents are updated.
   - Handling optimistic concurrency or duplicate submission issues.
5. **Observability & Logging**:
   - Structured logging (e.g. Pino / Winston) with request IDs.
   - Health check endpoints (`/healthz`, `/readyz`).

## Output Format
- Backend Topology & Route Summary
- Database & Model Integrity Audit
- Operational Vulnerabilities & Bugs (P0-P3)
- Concrete Remediation Snippets
