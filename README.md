# CertifyChain — Academic Certificate Verification on Stellar

> ⚠️ This README is a **Phase 2 scaffold stub**. The complete competition-ready
> README (architecture diagrams, deployment links, screenshots, user-testing
> evidence, feedback summary) is produced in **Phase 8: Submission Package**.

Tamper-evident academic credentials, issued by verified institutions,
verifiable in seconds — built on Stellar/Soroban.

## Monorepo layout

```
apps/web           React + Vite + TS frontend
apps/api           Node + Express + TS backend
contracts/credential_registry   Soroban smart contract (Rust)
packages/shared     Shared types, Zod schemas, hashing utils
docs/               Architecture, contract, API, testing, deployment docs
```

## Quick start (local development)

```bash
# from repo root
npm install

# copy env examples and fill in real values
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# run backend
npm run dev:api

# run frontend (separate terminal)
npm run dev:web
```

## Commands

```bash
npm run lint         # lint web + api
npm run typecheck    # typecheck web + api + shared
npm run test         # test web + api
npm run test:contract # cargo test for the Soroban contract
npm run build        # build shared -> api -> web
npm run format       # prettier --write
```

## Status

- [x] Phase 1 — Architecture
- [x] Phase 2 — Repository foundation (this commit)
- [ ] Phase 3 — Smart contract
- [ ] Phase 4 — Backend
- [ ] Phase 5 — Frontend
- [ ] Phase 6 — Integrations
- [ ] Phase 7 — Production readiness
- [ ] Phase 8 — Submission package

## License

MIT — see [LICENSE](./LICENSE).
