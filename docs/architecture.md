# Architecture

Monorepo: apps/web (React/Vite/TS), apps/api (Express/TS), contracts/credential_registry (Soroban/Rust), packages/shared (types/schemas/hashing).

## Data flow (issuance)
Institution form -> backend computes canonical metadata + SHA-256 hash -> institution signs issue_credential via Freighter -> tx submitted to Testnet -> backend persists record + tx hash -> student sees credential -> student claims via Freighter -> student shares link/QR -> recruiter verifies via ID/QR/link/file hash against backend + contract.

## Security model
On-chain: only credential_id, hashes, addresses, timestamps, status. Off-chain: bcrypt/Argon2, JWT access + httpOnly refresh cookie, role guards enforced server-side, wallet linking via challenge-response signature, backend always recomputes hashes server-side.

See root README.md for full route map, API map, and phase status.
