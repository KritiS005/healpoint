# HealPoint Implementation Plan

## Audit Snapshot
### Existing Implemented Features
- Next.js 16 App Router project with TypeScript, Tailwind CSS, shadcn-style UI primitives, Three.js landing visuals, Supabase SSR auth helpers, and `proxy.ts`.
- Public landing page, auth pages for login/signup/forgot/reset/verify, dashboard route guards, patient dashboard, doctor dashboard, admin dashboard, booking UI, and AI UI.
- Mock/Supabase-fallback data helpers in `lib/data/mock-data.ts`.
- Basic RBAC redirects in `lib/supabase/middleware.ts` for `/dashboard`, `/dashboard/patient`, `/dashboard/doctor`, and `/admin`.
- Playwright is already installed as a dev dependency.

### Missing Features
- Generated Prisma client, Prisma migrations, and database seed/verification workflow. A schema exists but currently fails Prisma 7 validation.
- Supabase RLS policy verification tests. RLS SQL files exist but have not been applied or cross-role verified.
- Complete booking APIs: create/list appointments exist, but update lifecycle, full notification fanout, and UI wiring are missing.
- Complete medical records APIs: upload validation exists, but list/detail/update/soft-delete and OCR pipeline are missing.
- Complete Razorpay payment APIs: order creation, checkout verification, and webhook routes exist, but refunds, retry/slot release flow, receipts, and UI checkout are missing.
- Video consultation: `/call/[roomId]`, WebRTC client, Supabase Realtime signaling, call-token route, room lifecycle, waiting room, screen share, reconnect/ICE restart.
- Complete Gemini AI routes: chat/report routes and Gemini helper exist, but prescription and consultation summary endpoints are missing and current routes fail typecheck.
- Distinct real-data dashboard widgets and actions for patient/doctor/admin.
- Complete security hardening: CSP/HSTS, origin checks, rate limits, audit logging, service-role isolation, RLS verification.
- `robots.txt`, `sitemap.xml`, complete Playwright suite, accessibility/performance checks, Lighthouse evidence.

### Broken Or Incompatible Features
- New API routes do not compile due nullable-auth and Supabase relation typing errors.
- Prisma 7 rejects the current `schema.prisma` datasource `url` configuration; `prisma validate` and `prisma generate` fail.
- Booking and dashboards visibly label core flows as mock data and do not persist business workflows.
- Payment statuses in mock data use `completed`, which is incompatible with the PRD enum (`pending/succeeded/failed/refunded/partially_refunded`).
- Supabase helper throws if environment is absent, so protected pages cannot render a graceful manual-config state locally.
- Security headers are partial and do not include CSP/HSTS. Permissions policy currently disables camera/microphone globally, which conflicts with video consultation.

### Features Needing Improvement
- UI data views need explicit loading, empty, error, and success/toast states.
- Dashboard data mapping needs real user/role scoping instead of generic mock loading.
- Auth forms need stronger validation and clearer failure states.
- Admin dashboard needs real doctor verification, analytics, payments/refunds, and audit logs.
- Booking UI needs payment step, Razorpay checkout integration, retry state, and slot release behavior.

## Requirement Checklist By Phase

### Phase 1: Foundation & Audit
- Add `IMPLEMENTATION_PLAN.md`.
- Add Prisma schema matching PRD Section 13 with additive-safe models/enums/indexes.
- Add Supabase RLS policy SQL files for profiles, doctors, patients, appointments, call rooms, medical records, prescriptions, payments, notifications, ai conversations, and audit logs.
- Add shared validation/types for API contracts.
- Harden proxy headers and route guards without breaking video permissions.
- Add audit/security/rate-limit helpers.
- Install missing required dependencies only after checking current equivalents.

### Phase 2: Core Data Flows
- Implement appointment create/list/update lifecycle APIs.
- Persist notifications on booking changes.
- Implement medical records list/create/update/soft-delete and upload validation.
- Ensure appointment confirmation creates call room only after payment success.

### Phase 3: Payments (Razorpay)
- Implement Razorpay order creation with server-only secret handling.
- Implement client checkout wiring with `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- Implement webhook route with HMAC verification, idempotent `provider_ref` handling, appointment confirmation, room creation, and audit logs.
- Implement refund route for admin cancellation, receipt fields, failed retry/15-minute release.

### Phase 4: Video Consultation
- Add `/call/[roomId]` page, token API, Supabase Realtime signaling, WebRTC peer connection, device precheck, waiting room, screen share, reconnect/ICE restart, and appointment-window enforcement.

### Phase 5: AI Module (Gemini)
- Replace OpenAI routes with Gemini server-side route handlers using `GOOGLE_API_KEY`.
- Add report explanation, prescription explanation, general chat, consultation summary, session memory, length limits/chunking, safety settings, retry-once-with-backoff, and standard fallback.
- Include PRD Section 16 disclaimer in every health-related response.

### Phase 6: Dashboards
- Patient: profile, appointments, call entry, reports, AI assistant, payments, notifications.
- Doctor: calendar, availability, patient list, appointment requests, prescriptions, call controls, earnings.
- Admin: user management, doctor verification, analytics, reports/issues, refunds, audit log viewer.

### Phase 7: Security Hardening
- Verify RLS with non-owner attempts.
- Verify rate limit rejection for n+1 request.
- Verify CSP/HSTS on real production response headers.
- Confirm no server-only secrets are exposed to client bundles/logs/errors.
- Preserve accurate TEE posture: compatible only, not enabled.

### Phase 8: Polish
- Responsive fixes at 375px and 1440px.
- Accessibility and keyboard/focus pass.
- SEO metadata, `robots.txt`, `sitemap.xml`.
- Playwright suite for auth, booking, payment, video-call join, AI chat.
- Lighthouse target evidence or documented misses.

## Planned DB Changes
- Add Prisma schema with enums: `ProfileRole`, `Gender`, `AppointmentStatus`, `CallRoomStatus`, `RecordType`, `PaymentStatus`, `NotificationType`, `AiContextType`, `AuditAction`.
- Add models: `Profile`, `Doctor`, `Patient`, `Appointment`, `CallRoom`, `MedicalRecord`, `Prescription`, `Payment`, `Notification`, `AiConversation`, `AuditLog`.
- Add indexes/uniques from PRD Section 13, including doctor slot uniqueness, provider refs, session IDs, soft-delete fields, and audit actor/time indexes.
- Add SQL triggers/functions for `updated_at`, call room creation after payment success, and appointment confirmation from payments.
- Add additive fields if needed for Razorpay idempotency/receipts/refunds without dropping existing columns.

## APIs To Add
- `POST/GET /api/appointments`
- `PATCH /api/appointments/[id]`
- `POST /api/reports/upload`
- `GET/PATCH/DELETE /api/medical-records/[id]`
- `POST /api/ai/chat`
- `POST /api/ai/explain`
- `POST /api/ai/prescription`
- `POST /api/ai/consultation-summary`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/webhook`
- `POST /api/payments/refund`
- `POST /api/calls/token`
- `POST /api/calls/signaling`
- `GET/POST /api/admin/doctors/verify`
- `GET /api/admin/analytics`
- `GET /api/health`

## UI Changes
- Replace mock-only copy on booking/payment/AI/dashboard flows with real states and manual-config/test-safe fallbacks.
- Add loading skeletons, empty states, error states, and success toasts/alerts for each data-driven view.
- Add Razorpay checkout step and payment retry state to booking.
- Add call room UI with prejoin checks and in-call controls.
- Add medical record CRUD/upload UI.

## Security Changes
- Add CSP and HSTS via Next config/proxy per local Next.js 16 docs.
- Keep Gemini/Razorpay/Supabase service-role secrets server-only.
- Add origin checks for mutating routes and Razorpay raw-body signature verification.
- Add per-route rate limits with local-memory fallback and production-ready adapter boundary.
- Add audit log writes for admin and payment state changes.
- Adjust permissions policy to allow camera/microphone where needed while limiting geolocation/payment origins.

## Testing Plan
- `npm run lint`
- `npm run build`
- `npx tsc --noEmit`
- Prisma validate/generate after schema changes.
- Playwright flows: auth redirect/login UI, booking-select-pay-confirm, Razorpay test-safe payment route, AI chat fallback/live contract, video-call join/prejoin UI.
- RLS SQL review plus executable non-owner access attempt where Supabase credentials are available.
- Header verification against a running production build.
- Responsive screenshots/checks at 375px and 1440px.

## Current Manual Configuration Expected
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `GOOGLE_API_KEY`
- `RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` if distinct from key secret in deployment
- `TURN_SERVER_URL` and TURN credentials for reliable WebRTC NAT traversal
