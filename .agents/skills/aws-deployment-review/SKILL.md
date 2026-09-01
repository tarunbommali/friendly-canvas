---
name: aws-deployment-review
description: Audits cloud infrastructure, AWS/Vercel deployment configs, Docker setup, CI/CD pipelines, IAM least privilege, environment variables, and caching strategies.
---

# AWS & Cloud Deployment Review

## Scope & Objective
Audit production readiness for AWS / cloud deployments, containerization, static asset hosting, serverless functions, and CI/CD pipelines.

## Review Checklist
1. **Hosting & Compute Strategy**:
   - Appropriateness of architecture (e.g. S3 + CloudFront for SPA frontend, ECS / App Runner / Lambda for Express API).
   - Multi-stage Dockerfile optimization (minimal base images, non-root user, layer caching).
2. **CDN & Edge Caching**:
   - CloudFront / Vercel cache-control headers on static bundles vs dynamic API responses.
   - Cache invalidation strategy on deployment.
3. **Environment & Secrets in Cloud**:
   - AWS Secrets Manager / Parameter Store integration vs plain environment variables.
   - IAM least privilege roles for compute instances.
4. **Networking & Scalability**:
   - VPC configuration, private subnets for database (MongoDB Atlas / RDS), NAT Gateway routing.
   - Auto-scaling policies and health check target groups.
5. **CI/CD & Release Safety**:
   - GitHub Actions / pipeline automation for testing, linting, building, and zero-downtime deployment.
   - Database migration strategy prior to app deployment.

## Output Format
- Infrastructure Assessment
- Cloud Architecture Findings (P0-P3)
- Step-by-Step Production Deployment Recommendations
