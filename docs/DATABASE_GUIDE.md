# Database Developer Guide

Welcome to the CarromVerse Database team! This guide explains our database schemas, security rules, local SQLite persistence, and migration workflows (`database/`).

## Quickstart

```bash
# Inspect SQLite schema
cat database/sqlite/schemas/match_history.sql

# Inspect Firestore rules
cat database/firebase/firestore/rules/firestore.rules

# Inspect PostgreSQL schema
cat database/postgresql/schemas/core_schema.sql
```

## Directory Structure
- `database/firebase/`:
  - `firestore/rules/`: Granular security rules for Cloud Firestore.
  - `firestore/indexes/`: Composite indexes.
  - `storage/rules/`: Firebase Storage access rules for avatar uploads.
- `database/sqlite/`:
  - `schemas/`: SQL schema for mobile client local match storage.
  - `migrations/`: Numbered migrations applied at mobile startup.
  - `seeds/`: Sample offline matches.
- `database/postgresql/`:
  - `schemas/`: Production relational schema for future backend cloud database.
  - `migrations/`: Numbered DDL migrations.
  - `seeds/`: Development and integration test seed data.

## Writing Migrations
1. Name migrations sequentially (`001_initial_schema.sql`, `002_add_field.sql`).
2. Make migrations idempotent (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
3. Maintain synchronization between SQLite definitions and `LocalDatabaseService.ts` in `apps/frontend`.
