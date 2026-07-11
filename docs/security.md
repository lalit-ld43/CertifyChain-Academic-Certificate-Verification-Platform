# Security

- Argon2id password hashing, JWT access (short-lived) + httpOnly refresh cookie.
- Role-based guards enforced server-side (middleware/auth.ts), never trusted from the client alone.
- On-chain data limited to hashes/addresses/timestamps/status — see spec's PII exclusion list.
- Wallet linking requires a signed challenge (nonce) before persisting an address to a user record.
- File uploads: MIME allowlist, size cap, generated filenames, private Cloudinary delivery.
- Rate limiting on auth, verification, and upload endpoints.
- Sentry/Pino redact secrets, cookies, and Authorization headers.
