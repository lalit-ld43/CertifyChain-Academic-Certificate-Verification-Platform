# credential_registry — Soroban Contract

## Deviation from spec worth noting

`revoke_credential` takes an explicit `caller: Address` parameter not listed
in the original spec signature. Soroban contracts have no implicit
`msg.sender` — every authorizing address must be passed in and explicitly
`require_auth()`'d. The function still enforces "only the issuing
institution or admin may revoke," exactly as specified; it just needs the
caller's address as an argument to check that against.

## Build & test locally

```bash
rustup target add wasm32-unknown-unknown
cd contracts/credential_registry
cargo test
cargo build --target wasm32-unknown-unknown --release
```

## Deploy to Testnet (placeholders — fill in with real values as you run these)

```bash
# 1. Install Stellar CLI
cargo install --locked stellar-cli --features opt

# 2. Configure testnet network
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# 3. Generate a deployment identity
stellar keys generate deployer --network testnet

# 4. Fund it on testnet (Friendbot)
stellar keys fund deployer --network testnet

# 5. Build
stellar contract build

# 6. Deploy — copy the printed contract ID into CONTRACT_ID / VITE_CONTRACT_ID
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/credential_registry.wasm \
  --source deployer \
  --network testnet

# 7. Initialize (replace CONTRACT_ID and ADMIN_ADDRESS with real values)
stellar contract invoke \
  --id CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- initialize --admin ADMIN_ADDRESS

# 8. Record the deployment transaction hash from step 6's output into
#    README.md and docs/contract.md — never fabricate this value.
```

## Function reference

See `src/lib.rs` for the full implementation. All 11 required functions from
the project spec are implemented: `initialize`, `register_institution`,
`approve_institution`, `suspend_institution`, `issue_credential`,
`claim_credential`, `revoke_credential`, `verify_credential`,
`credential_exists`, `get_institution`, `get_credential`.

## Test coverage (17 tests, `src/test.rs`)

Initialization, reinitialization rejection, institution registration/approval,
unauthorized-approval-path rejection, credential issuance, unapproved/suspended
issuance rejection, duplicate credential rejection, student claim + double-claim
rejection, verification, revocation + double-revocation rejection, unauthorized
revocation rejection, expiry recording + invalid-expiry rejection, institution
suspension.
