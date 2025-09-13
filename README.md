# Haus of Basquiat – Deployment & Operations README

This README focuses on deployment, environment variables, admin setup, domain connection, and the member signup flow. For deeper design/feature details, see DEPLOYMENT.md, DEPLOYMENT_GUIDE.md, and SUPABASE_* docs in the repository.

## Quick Start

- Requirements: Node.js 18+, Supabase project, Git, a deployment target (Vercel recommended).
- Install: `npm install`
- Copy envs: `cp .env.example .env.local` and fill required values.
- Run locally: `npm run dev` then open `http://localhost:3000`.

## Environment Variables

The app validates envs via `lib/env.ts`. Use `.env.local` for local dev and your platform’s secret manager in staging/production.

- Required
  - `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
  - `SUPABASE_SERVICE_ROLE_KEY` – Service role key (server-side only)
  - `NEXT_PUBLIC_APP_URL` – Base URL of the app (http://localhost:3000 in dev)
  - `NEXT_PUBLIC_API_URL` – API base path or URL (use `/api` or `http://localhost:3000/api`)
  - `JWT_SECRET` – 32+ char secret

- Recommended
  - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` – Auth callback in dev (e.g., `http://localhost:3000/auth/callback`)
  - `JWT_REFRESH_SECRET` – 32+ char secret

- Optional integrations
  - Email: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
  - Payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - AI: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `COPYLEAKS_API_KEY`
  - Analytics & Monitoring: `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
  - Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

What’s missing or easy to miss

- If you use the Vite-based code under `src/`, also set:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`, `VITE_APP_URL`
- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` (production) vs `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (dev): ensure the appropriate one is set for your environment and registered in Supabase Auth Redirect URLs.
- `worker.js` (optional background worker) expects:
  - `SUPABASE_URL`, `SUPABASE_KEY` (service key) and `STRIPE_KEY` (publishable/secret depending on usage). These are not in `.env.example` because the worker is optional; add them if you run it.
- OAuth providers (optional): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` (see `.env.production.example`).

Security note: Never commit secrets. If you previously pasted any keys in chat or code, rotate them immediately and store them only in your platform’s secret manager.

## Database & Supabase Setup

1. Create a Supabase project and copy API URL + keys.
2. Run SQL in order (via Supabase SQL editor):
   - `supabase-setup.sql` (core schema, RLS)
   - `supabase-storage-setup.sql` and/or `supabase-storage.sql` (buckets, policies)
   - `supabase-realtime-functions.sql`, `supabase-webhooks.sql` (optional)
   - `supabase-complete-setup.sql` (if you want the all-in-one)
3. Confirm RLS is enabled on all tables and policies exist.
4. Under Auth > URL Configuration, add your site URL(s) and the redirect URLs:
   - Dev: `http://localhost:3000/auth/callback`
   - Prod: `https://your-domain.com/auth/callback`

## Deployment

Vercel (recommended)

- Push repo to GitHub/GitLab/Bitbucket.
- Import project to Vercel.
- Set environment variables from `.env.production.example` and your own secrets.
- Build and deploy. Ensure `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` point to your live domain.
- In Supabase, add the production redirect URL.

Railway

- Optionally deploy an Express backend if you use `backend/` (not required for Next.js API routes).
- Add envs for the frontend service (NEXT_PUBLIC_*) and backend service (service role key, DB URLs, etc.).
- Update `CLIENT_URL` in backend envs to your frontend URL if using the separate backend.

Docker / Nginx (advanced)

- Use `Dockerfile.staging` and `nginx/staging.conf` as references.
- Frontend runs on Node/Next; serve behind Nginx with TLS termination.
- Reverse proxy `/api` to the Next.js server or to your separate backend.

Production checklist

- Supabase schema + RLS applied
- All required envs set (see above)
- Auth redirect URL configured in Supabase
- `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_API_URL` set to your domain
- Domain connected and HTTPS enabled
- Optional: Sentry/GA/Stripe configured

## Connect a Custom Domain

Vercel

- Vercel Project > Settings > Domains > Add `your-domain.com`.
- Update DNS at your registrar per Vercel’s instructions.
- After propagation, set:
  - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
  - `NEXT_PUBLIC_API_URL=https://your-domain.com/api` (or your API host)
- In Supabase Auth settings, add `https://your-domain.com` and `https://your-domain.com/auth/callback`.

Nginx (self-hosted)

- Point DNS A/AAAA to your server.
- Use `nginx/staging.conf` as a starting point; adjust `server_name` and reverse proxy targets.
- Terminate TLS (e.g., with certbot) and forward `/` and `/api` to your app.

## Admin Setup

- Create an initial admin in Supabase:
  - Open `setup-admin.sql`, replace placeholders with your email/password, and run in Supabase SQL.
  - This inserts an auth user and a `user_profiles` row with role `Admin`.
- Verify role and access:
  - DB uses `Admin` (capital A) in `user_profiles.role`.
  - App logic typically lowercases roles client-side; ensure admin checks align. If you see access issues on `/admin`, confirm the profile record exists and has role `Admin`.
- Protect `/admin`:
  - Middleware enforces auth and role checks. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set so the middleware can read user session and profile.

## Member Signup Flow

- Navigate to `/auth/signup`.
- Step 1: Provide email and password.
- Step 2: Enter profile details (display name, pronouns, interests, experience).
- Step 3: Choose a House and submit application.
- Email verification: user receives a link (magic link flow supported on Sign In). Ensure redirect URL is configured.
- Status: new users are `Applicant`/`pending` in `user_profiles` until reviewed.
- Admin review: admins use `/admin` to review applications, approve, and set House/role.
- Member access: once approved (role `Member` or higher), users can access member-only areas like `/feed`, `/chat`, and documents.

Notes

- The Sign In page also supports magic links. Ensure the client uses env-based Supabase config; do not hardcode keys. If you see placeholders in `app/auth/signin/page.tsx`, switch to using values from `lib/api.ts` (which already reads `NEXT_PUBLIC_*` envs).
- If you add Stripe-based subscriptions, configure the three Stripe envs and webhook.

## Troubleshooting

- Auth redirects back to sign in:
  - Check Supabase redirect URL matches `NEXT_PUBLIC_*_REDIRECT_URL` and your domain.
  - Confirm cookies are set and `middleware.ts` can read them.
- Admin route redirects to `/feed`:
  - Ensure `user_profiles` has your user with role `Admin`.
  - Verify envs are loaded (especially Supabase URL/key) so profile queries succeed.
- 401/403 on API calls:
  - Confirm `apiClient` has a token set (login flow) and `NEXT_PUBLIC_API_URL` is correct.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – build for production
- `npm run start` – start production server
- `npm run lint` – lint
- `npm run type-check` – TypeScript check

## Security and Secrets

- Do not commit `.env.*` with real values.
- Store secrets in Vercel/Railway/your platform’s secret manager.
- If any secret was ever shared in chat or logs, rotate it immediately and update it only in the secret manager.
