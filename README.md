# My App

> Serverless full-stack application boilerplate on AWS.

## Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| IaC        | SST v4                                 |
| Frontend   | Vite + React 19 (SPA)                  |
| Backend    | Node.js Lambda handlers                |
| Auth       | AWS Cognito (JWT)                      |
| Database   | DynamoDB (single-table, ElectroDB ORM) |
| Validation | Zod v4                                 |
| Testing    | Vitest                                 |
| Tooling    | TypeScript 7, Oxlint, Prettier         |
| CI/CD      | GitHub Actions                         |

## Quick Start

```bash
# Use the correct Node version
nvm use

# Install dependencies
pnpm install

# Start SST dev environment (deploys to AWS with live reloading)
pnpm sst dev
```

## Project Structure

```
boilerplate/
├── infra/                    # SST infrastructure definitions
│   ├── auth.ts               # Cognito User Pool
│   ├── database.ts           # DynamoDB table
│   ├── api.ts                # API Gateway + routes
│   └── frontend.ts           # Static site (CloudFront)
├── packages/
│   ├── core/                 # Shared: Zod schemas, ElectroDB entities
│   ├── functions/            # Lambda handlers + tests
│   └── frontend/             # Vite + React SPA
├── docs/                     # PRD system for feature specs
├── .github/workflows/        # CI/CD pipelines
├── sst.config.ts             # SST entry point
└── CLAUDE.md                 # AI assistant guidance
```

## Commands

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `pnpm sst dev`    | Start dev environment with live reload |
| `pnpm sst deploy` | Deploy to default stage                |
| `pnpm test`       | Run all tests                          |
| `pnpm typecheck`  | Typecheck all packages                 |
| `pnpm lint`       | Lint with Oxlint                       |
| `pnpm lint:fix`   | Apply Oxlint auto-fixes                |
| `pnpm format`     | Check formatting                       |
| `pnpm format:fix` | Fix formatting                         |

## Checks

- **Pre-commit:** Oxlint and Prettier on staged files (`lint-staged`).
- **Pre-push:** `pnpm typecheck`, then `pnpm test`.
- **Pull requests:** `.github/workflows/pr.yml` runs Typecheck, Lint & Format, Test (with a coverage comment) and Build as parallel jobs.
  If you protect `master`, require those four checks by name.

## Deployment

### Environments

| Stage        | Trigger                  | Domain              |
| ------------ | ------------------------ | ------------------- |
| `testing`    | Push to `master`         | `api.testing.{TLD}` |
| `production` | GitHub Release published | `api.{TLD}`         |

### Required GitHub Secrets

- `AWS_ROLE_ARN` — IAM role for OIDC authentication
- `ANTHROPIC_API_KEY` — (optional) for Claude Code CI integration

### Required GitHub Variables

- `AWS_REGION` — e.g., `us-east-1`
- `TLD` — your domain (e.g., `example.com`)

## Customizing

1. Replace `my-app` and `@my-app` in all `package.json` files and `sst.config.ts`, then run `pnpm install` and commit the regenerated `pnpm-lock.yaml` (CI runs `pnpm install --frozen-lockfile`, which fails if the lockfile is out of sync)
2. Replace `myapp` service name in `packages/core/src/entities.ts`
3. Set your domain in the `TLD` environment variable
4. Add your domain entities, schemas, and handlers following the existing patterns
5. Update `CLAUDE.md` with your project-specific documentation

## Feature Development

This project uses a PRD (Product Requirements Document) system for feature specs:

1. Copy `docs/TEMPLATE.md` to `docs/PRD-NNN-slug.md`
2. Fill in the spec
3. Add it to `docs/INDEX.md`
4. Set status to `ready` when implementation can begin
