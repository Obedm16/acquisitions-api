# Docker + Neon setup

This repo is Dockerized for both local development (with Neon Local) and production (with Neon Cloud).

## Prerequisites
- Docker Desktop (with Compose v2)
- A Neon account with:
  - NEON_API_KEY
  - NEON_PROJECT_ID
  - PARENT_BRANCH_ID (the branch ID to fork from, e.g. your main branch)

## Files added
- Dockerfile — multi-stage Node 20 Alpine image
- .dockerignore — keeps images small, excludes .env files
- docker-compose.dev.yml — app + Neon Local proxy with ephemeral branches
- docker-compose.prod.yml — app only (connects to Neon Cloud)
- .env.development — dev variables (used by compose for local)
- .env.production — prod variables (used by compose in prod)

## Environment variables
- DATABASE_URL switches automatically by Compose using env_file:
  - Dev: postgres://devuser:devpass@neon-local:5432/devdb
  - Prod: postgres://...neon.tech... (your actual Neon Cloud URL)

## Development (Neon Local with ephemeral branches)
1) Fill .env.development with your Neon credentials:
   - NEON_API_KEY, NEON_PROJECT_ID, PARENT_BRANCH_ID
2) Start the stack:
   powershell
   docker compose -f docker-compose.dev.yml up --build
3) App URL: http://localhost:4001
4) Postgres endpoint (from app’s perspective): postgres://devuser:devpass@neon-local:5432/devdb
   - The Neon Local container creates an ephemeral branch on start and deletes it on stop.
5) Stop:
   powershell
   docker compose -f docker-compose.dev.yml down -v

Notes
- The dev service runs "npm ci && npm run dev" and mounts your working directory for live reload.
- If you change dependencies, restart the app container.

## Production (Neon Cloud)
1) Fill .env.production:
   - DATABASE_URL=postgres://USER:PASSWORD@<your-project-region>.aws.neon.tech/DBNAME?sslmode=require
2) Build and run locally (simulating prod):
   powershell
   docker compose -f docker-compose.prod.yml up --build -d
3) Or build/push an image for your platform/registry:
   powershell
   docker build -t your-registry/production-api:latest .
   docker push your-registry/production-api:latest
4) Deploy the container to your target (ECS, Kubernetes, VM, etc.) and inject the same env from .env.production (via your secrets manager).

## Useful commands
- Logs (dev):
  powershell
  docker compose -f docker-compose.dev.yml logs -f app
- Recreate ephemeral DB branch:
  powershell
  docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up --build

## FAQ
- Why no DB container in production?
  Neon is serverless and runs in the cloud. The app connects to Neon’s cloud URL; the Neon Local proxy is only for local development.
- Does the app use the same DATABASE_URL key for both environments?
  Yes. Compose supplies DATABASE_URL from the respective env file, and the app reads process.env.DATABASE_URL.
