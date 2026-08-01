# Deployment

## MongoDB Atlas
Create a free/shared cluster, add a database user, allow network access from your Render service (or 0.0.0.0/0 during setup only), and copy the connection string into MONGODB_URI.

## Render (backend)
Root directory: apps/api. Build command: `npm install && npm run build --workspace=packages/shared && npm run build --workspace=apps/api`. Start command: `npm run start --workspace=apps/api`. Health check path: /api/v1/health. Set all apps/api/.env.example variables in Render's environment settings. Configure CLIENT_URL to your Vercel frontend origin for CORS.

## Vercel (frontend)
Root directory: apps/web. Framework: Vite. Build command: `npm run build --workspace=apps/web` (run from repo root with shared package pre-built). Output directory: apps/web/dist. Add a rewrite so all paths serve index.html (SPA routing). Set all apps/web/.env.example variables, pointing VITE_API_URL at your Render backend.

## Cloudinary
Create an account, use backend-only API secret (never in frontend), store certificates with `type: authenticated` for private delivery.

## PostHog / Sentry
Create projects, set the DSN/key env vars, send one test event/error from each app to confirm wiring, then screenshot both dashboards for the submission package (Phase 8).

[PLACEHOLDER] Fill in real URLs, contract ID, and transaction hashes once deployed — do not fabricate these values.
