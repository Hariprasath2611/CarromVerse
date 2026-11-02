# CarromVerse Database Layer

Central repository for all database definitions, migrations, rules, and seed files.

## Subdirectories
- `firebase/`:
  - `firestore/rules/`: Security rules for Cloud Firestore
  - `firestore/indexes/`: Composite indexes for queries
  - `storage/rules/`: Security rules for Firebase Storage
  - `config/`: Firebase environment and project configuration
- `sqlite/`:
  - `schemas/`: SQL schema definitions for local mobile SQLite
  - `migrations/`: Versioned migrations
  - `seeds/`: Seed records for testing
- `postgresql/`:
  - `schemas/`: SQL definitions for server-side relational database
  - `migrations/`: Versioned migrations
  - `seeds/`: Initial test and development data
- `documentation/`: Detailed architectural documentation for each database engine
