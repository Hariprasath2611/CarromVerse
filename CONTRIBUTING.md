# Contributing to CarromVerse

Thank you for contributing to CarromVerse! To maintain architecture integrity and high code quality, please adhere to these guidelines.

## Monorepo Workflow
- Branch naming convention: `feature/<module>-<description>`, `bugfix/<issue>`, or `refactor/<target>`.
- Commit messages follow Conventional Commits: `feat(engine): add cushion rebound damping`, `fix(rules): queen cover settlement on same shot`.

## Architectural Rules
1. **Domain Isolation**:
   - `packages/game-logic`: Pure game rules only. No React or Phaser dependencies.
   - `packages/game-engine`: Physics & rendering only. No React Native direct rendering.
   - `apps/frontend`: UI screens & state. Communicates with game engine via WebView messages.
   - `apps/backend`: Server logic, authentication, and REST APIs.
2. **Type Safety**:
   - Every interface shared across boundaries must reside in `packages/shared-types`.
   - Never use `any` unless strictly interfacing with legacy dynamically-typed third-party libraries.
3. **Automated Testing**:
   - Every bug fix or new feature must include a corresponding automated test.
   - Tests run in Node.js native test runner via `npm test`.

## Pull Request Checklist
- [ ] `npm run typecheck` passes with 0 errors across all workspaces.
- [ ] `npm run test` passes with 100% success across all packages and apps.
- [ ] Documentation updated in `docs/` if modifying public contracts or architectures.
