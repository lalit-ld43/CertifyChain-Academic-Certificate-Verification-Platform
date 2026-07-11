# Testing

Contract: `cd contracts/credential_registry && cargo test` (17 tests in src/test.rs).
Backend: `npm run test --workspace=apps/api` (mongodb-memory-server integration tests in apps/api/tests/).
Frontend: `npm run test --workspace=apps/web` (vitest + testing-library; add component tests alongside existing pages as they are completed).
