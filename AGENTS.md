# AGENTS

## Overview

TypeScript (ES2020) Express 5 CRM application using a repository–service architecture with RBAC.

## Directory Guide

- `src/server.ts` – application entry point.
- `src/app.ts` – Express configuration and middleware.
- `src/config/` – app & database configuration.
- `src/core/http/` – HTTP helpers (status codes, responses, error handling, async wrapper).
- `src/core/middleware/` – `requestId`, `auth`, `notFoundHandler`.
- `src/controllers/` – thin controllers; delegate logic to services.
- `src/services/` – business logic; interact with repositories.
- `src/repositories/` – repository contracts for data persistence.
- `src/domain/` – domain entities and shared types.
- `src/rbac/` – role/permission enums and helpers.
- `src/router/` – root router and versioned routers (`v1`).
- `src/data/` – data source config with a placeholder implementation.
- `src/db/` – placeholders for migrations/seeders (unused until ERD is ready).
- `src/types/express.d.ts` – Express type augmentation.

## Conventions

- Use strict TypeScript; target ES2020.
- Wrap async handlers with `asyncHandler`.
- Use response helpers (`ok`, `created`, `noContent`); throw `HttpError` subclasses for failures.
- Extend `Express.Request` via `src/types/express.d.ts` when adding request properties.
- Maintain controller → service → repository layering.
- Enforce permissions through RBAC utilities (`src/rbac`).
- Place future migrations/seeds in `src/db/migrations` and `src/db/seeders`.
- Run the development server with `npm run dev`.
