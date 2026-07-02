# HealPoint Status

## Completed Features (Verified)
- PRD v2.1 was read from `C:\Users\kriti\Downloads\HealPoint_PRD_v2.1.md`; it is not present in the repo root.
- `IMPLEMENTATION_PLAN.md` exists.
- Dependencies are installed and `npm install` completes.
- `package.json` includes Next.js 16, TypeScript, Tailwind, Supabase, Playwright, Prisma packages, and Zod. No Razorpay SDK is installed; Razorpay is currently implemented via direct REST/HMAC helpers.
- Prisma schema file exists at `prisma/schema.prisma`.
- RLS SQL policy files exist under `supabase/policies/`.
- Route handlers exist for:
  - `/api/ai/chat`
  - `/api/ai/explain`
  - `/api/appointments`
  - `/api/appointments/[id]`
  - `/api/calls/token`
  - `/api/calls/signaling`
  - `/api/health`
  - `/api/medical-records`
  - `/api/medical-records/[id]`
  - `/api/payments/create-order`
  - `/api/payments/refund`
  - `/api/payments/verify`
  - `/api/payments/webhook`
  - `/api/reports/upload`
- Helper files exist for Gemini, Razorpay HMAC/order creation, rate limiting, API responses, auth context, Supabase service client, Prisma singleton, and Zod API schemas.
- `app/robots.ts` and `app/sitemap.ts` exist.
- `npm run build`, `npx tsc --noEmit`, and `npm run lint` pass.
- `npm run prisma:validate` passes when `DATABASE_URL` is supplied. Prisma client generation was run successfully with a placeholder local `DATABASE_URL`.
- `@prisma/client` and `prisma` are reconciled at v6.19.3 in `package.json`, `package-lock.json`, and `node_modules`.
- Production response header check against `http://localhost:3000` confirms CSP, HSTS, COOP, content-type, frame, referrer, and camera/microphone-compatible permissions policy are present. `X-Powered-By` is no longer present after a clean production restart.
- Secret scan found no server-only secret references in client components. `SUPABASE_SERVICE_ROLE_KEY` appears only in a server route for call-token signing.

## Partially Implemented Features
- Foundation & Audit: plan, schema, policy files, and helper scaffolding exist, but the project does not compile and Prisma validation fails.
- Auth/RBAC: Supabase auth pages and dashboard/admin route guards exist, but protected pages depend on live Supabase configuration and are not E2E-verified.
- AI: chat and report explanation routes use Gemini helper and server-side `GOOGLE_API_KEY` and compile, but prescription explanation and consultation summary endpoints are missing.
- Booking/core data: appointment create/list route exists, but booking UI is still mock-oriented and not wired end-to-end to appointment/payment APIs.
- Appointment lifecycle update route exists and compiles, but lifecycle flows are not E2E-verified.
- Payments: Razorpay create-order, checkout verify, webhook, and admin refund routes exist with HMAC/server-side helpers, but receipt/invoice storage, retry slot release, UI checkout wiring, and Playwright verification are missing.
- Medical records: upload/list/detail/update/soft-delete routes exist and compile, but OCR pipeline and UI wiring are missing.
- Video consultation: `/call/[roomId]`, call token route, and signaling route exist and compile. WebRTC UI includes device check, local/remote video surfaces, controls, screen share, reconnect state, and ephemeral chat scaffold, but it is not E2E-verified and is not fully wired to appointment token issuance.
- SEO basics: `robots.ts` and `sitemap.ts` exist, but production build does not pass yet.

## Missing Features
- `prisma/migrations/` and generated Prisma client.
- `/api/ai/prescription`
- `/api/ai/consultation-summary`
- `/api/admin/doctors/verify`
- `/api/admin/analytics`
- `/call/[roomId]` video consultation UI
- WebRTC/Supabase Realtime signaling implementation
- Razorpay checkout UI integration
- Admin refund UI and payment oversight
- Real dashboard widgets backed by role-scoped data
- Playwright config and project test files
- Actual RLS non-owner verification test
- CSP/HSTS in `next.config.ts` or verified production response headers
- Lighthouse/accessibility/performance verification

## Broken Features
- No Playwright user flow is verified yet.
- Current Supabase RLS policies have not been applied to a database or tested with non-owner access attempts.

## Current Phase
- Phase 1: Foundation & Audit. Compile foundation and production header verification are fixed. Live RLS verification remains blocked on database/application of schema and policies.

## Last Verified Working Point
- `npm install` completed after reconciling Prisma packages.
- `npm run build`, `npx tsc --noEmit`, `npm run lint`, and Prisma validation pass.
- Existing UI/source files are present, but no end-to-end feature flow is verified.

## Remaining Work
- Re-apply and test RLS policies with non-owner access attempts.
- Add missing foundation/admin/security routes and helpers that remain in the PRD.
- Add missing PRD route handlers in phase order.
- Add Playwright tests and perform actual flow/security/header verification.

## Current Compile Status
- `npm install`: pass; npm reports 5 moderate vulnerabilities.
- `npm run build`: pass.
- `npx tsc --noEmit`: pass.
- `npm run lint`: pass.
- `npm run prisma:validate`: pass when `DATABASE_URL` is supplied.
- `npm run prisma:generate`: pass when `DATABASE_URL` is supplied.

## Exact Next Task
- Resume Phase 2 core data flows by adding appointment lifecycle update and medical-records CRUD routes, while keeping live RLS verification as a manual-config blocker.

## TEE Status
- HealPoint is architecturally TEE-compatible per PRD Section 21, but this deployment is not running inside a Trusted Execution Environment.
