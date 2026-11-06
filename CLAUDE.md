# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

<!-- TODO: Replace with your project description -->

[Project Name] — a serverless full-stack application on AWS.

## Stack

- **IaC**: SST v4 (infrastructure defined in `infra/` directory)
- **Frontend**: Vite + React 19 (SPA, no SSR), deployed to CloudFront
- **Backend**: Node.js Lambda handlers
- **Auth**: Cognito User Pool with custom React UI, JWT-based (`Authorization: Bearer <idToken>`)
- **Database**: DynamoDB single-table design with ElectroDB ORM
- **Validation**: Zod v4 schemas for all API input/output; types are `z.infer<>` derived
- **Tooling**: TypeScript 7 (native `tsc`), Oxlint, Prettier, Vitest

## Monorepo Structure

```
infra/            # SST infrastructure (auth, database, api, frontend)
packages/
  core/           # Zod schemas, ElectroDB entities, shared utilities
  functions/      # Lambda handlers
  frontend/       # Vite + React SPA
sst.config.ts     # SST entry point (imports from infra/)
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Start SST dev environment (deploys to AWS, live Lambda reloading)
pnpm sst dev

# Deploy to a specific stage
pnpm sst deploy --stage testing

# Run all tests
pnpm test

# Typecheck all packages
pnpm typecheck

# Lint (Oxlint, config in .oxlintrc.json)
pnpm lint

# Format code
pnpm format:fix
```

## Checks

| Where              | Runs                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| Pre-commit (husky) | `lint-staged`: Oxlint on staged `ts/tsx/js/jsx`, Prettier on staged files |
| Pre-push (husky)   | `pnpm typecheck`, then `pnpm test`                                        |
| PR CI (`pr.yml`)   | Parallel jobs: Typecheck, Lint & Format, Test (+ coverage comment), Build |

Run `pnpm lint && pnpm typecheck && pnpm test` before pushing if you bypass the hooks.

TypeScript 7 ships only the native `tsc`, not the JS compiler API. If you add a tool that imports `typescript` (typescript-eslint, ts-jest, vite-plugin-dts, ...), give it TS 6 through an alias such as `"typescript6": "npm:typescript@^6"` and point the tool at it; keep `tsc` on TS 7.

## Architecture

### DynamoDB Single-Table Design (ElectroDB)

All entities share one DynamoDB table, accessed via ElectroDB entities defined in `packages/core/src/entities.ts`. Client setup is in `packages/core/src/client.ts`.

### API Endpoints

| Method | Path             | Auth | Purpose                           |
| ------ | ---------------- | ---- | --------------------------------- |
| `GET`  | `/health`        | None | Health check                      |
| `POST` | `/auth/register` | None | Create Cognito user + DDB profile |

### Auth Flow

Client authenticates directly with Cognito (via `amazon-cognito-identity-js`), receives JWT tokens. The `idToken` is sent on API calls. API Gateway uses a Cognito JWT authorizer.

## Code Patterns to Follow

- **Types**: Define Zod schemas in `packages/core/src/schemas.ts`, export `z.infer<>` types
- **DynamoDB**: Use ElectroDB entities from `packages/core/src/client.ts` (never raw DynamoDB SDK)
- **Entity definitions**: Add new entities in `packages/core/src/entities.ts`
- **Lambda handlers**: Follow the pattern in `packages/functions/src/register.ts` (validate input with Zod `.safeParse()`, extract userId from JWT claims, interact with ElectroDB, return structured JSON)
- **API calls (frontend)**: Follow `packages/frontend/src/api.ts`
- **SST routes**: Follow the route definitions in `infra/api.ts`

## PRD System

All feature specifications live in `docs/`. Start with **`docs/INDEX.md`** to find what to work on.

### Workflow

1. Check `docs/INDEX.md` for PRDs with status `ready`.
2. Read the target PRD fully before starting implementation.
3. Update the PRD status to `in-progress` in `docs/INDEX.md`.
4. Follow the Implementation Approach section step-by-step.
5. When done, update the status to `done` in `docs/INDEX.md`.
