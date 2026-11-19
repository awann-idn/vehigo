# Vehigo Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Vehigo Android app and same-repo web admin dashboard with Supabase-backed identity, inventory, availability, orders, partner operations, and administration, without production mock data or false-success fallbacks.

**Architecture:** Keep the existing Expo app and navigation, add an explicit web-only admin route guarded by the authenticated `admin` role, and share Supabase client, generated/manual database types, query infrastructure, and auth session. Postgres constraints/RPCs/RLS remain authoritative for availability, order totals, ownership, and status transitions.

**Tech Stack:** Expo SDK 58, React Native/Web, TypeScript, Supabase Auth/Postgres/Storage/Realtime, TanStack Query, React Hook Form, Zod.

**Spec:** `docs/superpowers/specs/2026-11-19-vehigo-release-design.md`

## Global Constraints

- Target release is Android plus a web admin dashboard in the same repository.
- Supabase is the single source of truth for production data.
- No production route may read `src/data/mock.ts` or silently return mock data after a backend error.
- Preserve existing styling, layout, colors, and visual structure unless a release bug requires a minimal state treatment.
- Client uses only the publishable/anon key; service-role secrets never enter the repo or bundle.
- All production tables have RLS; renter, mitra, and admin access is separated.
- Payment gateway is deferred; payment UI must expose honest internal states and never claim an external payment succeeded.
- Migrations run in order on an empty database; seed data is idempotent.
- Auth passwords are never hardcoded in migrations.
- Every task ends with focused verification plus `npx expo lint` and `npx tsc --noEmit` when applicable.

## Review Focus

- Repeated booking submission or date race: database must prevent duplicate/conflicting reservations; covered by Task 4.
- User without a profile or with a stale role: app must show a recoverable state and never label an authenticated user as a guest; covered by Task 3.
- Renter requesting another mitra's records: RLS/API must deny it; covered by Tasks 2 and 8.
- Backend failure during mutation: UI must show failure and invalidate/refetch rather than showing success; covered by Tasks 4–7.
- Admin route opened by a non-admin or directly by URL: route must redirect/deny consistently; covered by Task 8.

---

### Task 1: Audit and remove production mock dependencies

**Files:**
- Modify: all files currently importing `src/data/mock.ts`.
- Create/modify: focused mapping/types files only where needed.
- Test/verification: repository search and affected screen checks.

**Interfaces:**
- Consumes: existing API/hooks and database types.
- Produces: a written inventory of every mock, hardcoded identity, placeholder action, and fallback; production screens use real hooks or explicit empty/error states.

- [ ] Search all imports/usages of `src/data/mock.ts`, hardcoded user labels, static dates, and success alerts.
- [ ] Classify each usage as type-only, seed source, or production behavior.
- [ ] Replace production behavior with the existing Supabase hook/API or an explicit loading/empty/error state.
- [ ] Verify no production screen imports mock records and no failed request returns demo data.
- [ ] Run `npx expo lint` and `npx tsc --noEmit`.

### Task 2: Make schema, security, availability, and seed release-ready

**Files:**
- Modify: `supabase/migrations/0001_init.sql`, `0002_rls.sql`, `0003_reviews.sql`, `0004_order_transitions.sql` as required.
- Create: ordered migration(s) for availability, booking conflict protection, admin policies, and seed support.
- Modify: `supabase/seed.sql`, `src/lib/database.types.ts`.

**Interfaces:**
- Consumes: existing schema and data from `src/data/mock.ts`.
- Produces: idempotent seed data for the four listed mitra businesses and five listed vehicles; authoritative availability query/function; safe order conflict constraint/function; admin role policies and typed DB contract.

- [ ] Define/verify constraints, indexes, timestamps, status history, and relationships required by the accepted spec.
- [ ] Add availability representation that supports blocked dates and active-order conflicts.
- [ ] Add an atomic server-side booking path that validates dates, ownership, and total before inserting an order.
- [ ] Convert existing mock mitra/vehicle data into stable, repeatable seed records without passwords or fake auth credentials.
- [ ] Add a bootstrap procedure for creating Auth users and assigning admin/mitra roles safely.
- [ ] Verify migrations apply sequentially on a clean database and seed can run twice without duplicates.

### Task 3: Finish auth, profile hydration, and role guards

**Files:**
- Modify: `src/features/auth/AuthProvider.tsx`, `src/features/auth/useAuth.ts`, `src/lib/supabase.ts`.
- Modify: `src/navigation/AppNavigator.tsx`, `src/navigation/RenterTabs.tsx`, `src/navigation/OwnerTabs.tsx`.
- Modify: profile/login/signup screens and related hooks.

**Interfaces:**
- Consumes: `profiles` role/profile contract from Task 2.
- Produces: stable hydrated session/profile state, `requireRole`/guard behavior, and UI identity sourced from the current profile.

- [ ] Test session restore, profile loading, missing-profile recovery, logout, and role changes.
- [ ] Remove guest-name fallback for authenticated users; show a loading or actionable profile state instead.
- [ ] Ensure renter, mitra, and admin route decisions use the server profile role.
- [ ] Verify email auth and configured OAuth callback behavior on web and Android-compatible flow.
- [ ] Run lint/typecheck and manual login/logout/restart checks.

### Task 4: Make vehicle data and booking calendar realtime/authoritative

**Files:**
- Modify: `src/api/vehicles.ts`, `src/hooks/useVehicles.ts`, `src/screens/renter/SearchResultsScreen.tsx`, `VehicleDetailScreen.tsx`, `DatePickerScreen.tsx`.
- Modify: `BookingCheckoutScreen.tsx`, relevant query keys and database RPC/API files.

**Interfaces:**
- Consumes: Task 2 availability and booking contract; Task 3 current user.
- Produces: `getVehicleAvailability(vehicleId, range)`, disabled/conflict date state, and checkout that receives server-validated dates/pricing.

- [ ] Query availability and active orders for the visible month/range.
- [ ] Mark blocked/unavailable dates and prevent selecting them.
- [ ] Revalidate the range and price at checkout; handle a conflict with a recoverable error and refresh.
- [ ] Ensure listings, details, mitra names, ratings, and status come from Supabase.
- [ ] Verify date boundaries, same-day rental behavior, past dates, and concurrent booking attempts.

### Task 5: Complete renter order and honest payment-internal flow

**Files:**
- Modify: `src/api/orders.ts`, `src/hooks/useOrders.ts`, booking identity/checkout/payment/gateway screens.
- Modify: `src/api/payments.ts`, order detail/list screens, status labels.

**Interfaces:**
- Consumes: Task 2 atomic booking/status contract and Task 4 validated selection.
- Produces: create/list/detail/cancel order operations with consistent status history and payment states `pending`, `manual_review`, or `cancelled` until a real gateway exists.

- [ ] Move total/day calculation authority to the server path and display the returned order.
- [ ] Invalidate renter and mitra order queries after mutations.
- [ ] Ensure payment screens never claim gateway success and clearly represent deferred payment.
- [ ] Verify order reload, cancellation rules, invalid transitions, and backend failures.

### Task 6: Complete mitra fleet, order, inspection, and review operations

**Files:**
- Modify: owner screens, `src/api/vehicles.ts`, `src/api/inspections.ts`, `src/api/reviews.ts`, related hooks.
- Modify: storage upload and document handling only where required by real operations.

**Interfaces:**
- Consumes: Task 2 RLS/ownership and Task 5 order/status contract.
- Produces: mitra-scoped fleet CRUD, order actions, inspection persistence, and review persistence with refetch/error behavior.

- [ ] Verify mitra sees and edits only owned vehicles.
- [ ] Persist add/edit/status changes and refresh fleet/dashboard queries.
- [ ] Persist inspection evidence/findings/fees and enforce order ownership/status.
- [ ] Persist renter/vehicle/mitra reviews once permitted by order state.
- [ ] Verify all mutation failures remain visible and do not update optimistic UI incorrectly.

### Task 7: Finish realtime chat and database notifications

**Files:**
- Modify: `src/api/chat.ts`, `src/hooks/useChat.ts`, chat screens, `src/api/notifications.ts`, notification hooks/screens.
- Modify: Supabase notification/message policies/triggers if needed.

**Interfaces:**
- Consumes: authenticated user and order participants from Tasks 3–5.
- Produces: participant-scoped chat threads/messages, realtime updates, notification list, and mark-read mutation.

- [ ] Verify only participants can read/send messages for an order.
- [ ] Subscribe/unsubscribe cleanly and reconcile realtime events with query cache.
- [ ] Create notifications from real state changes or explicit server operations.
- [ ] Verify unread/read behavior, offline/error sending, and refresh persistence.

### Task 8: Build the same-repo web admin route

**Files:**
- Modify: `App.tsx`/navigation entry and web route handling.
- Create: admin screens/components/hooks/API modules under the existing source structure.
- Modify: shared auth/query/types and admin RLS/RPC migration as required.

**Interfaces:**
- Consumes: Task 2 admin authorization and Task 3 hydrated role/session.
- Produces: protected admin web routes for login, dashboard, users, mitras, vehicles, orders, verification, and audit/status history.

- [ ] Define route entry and redirect behavior for unauthenticated/non-admin users.
- [ ] Build dashboard metrics and paginated lists from Supabase, not hardcoded arrays.
- [ ] Add admin actions with explicit authorization and consistent errors.
- [ ] Add loading, empty, error, and pagination states without changing existing mobile visual design.
- [ ] Verify direct URL access and cross-role denial on web.

### Task 9: Release hardening, QA, and Android/web release artifacts

**Files:**
- Modify: `README.md`, `eas.json`, `app.json`, environment documentation, and release scripts/config only as required.
- Create: QA/release checklist and migration bootstrap documentation.

**Interfaces:**
- Consumes: all completed application slices.
- Produces: reproducible database setup, documented external configuration, clean Android build, and verified admin web export.

- [ ] Run clean migration/seed verification against a disposable Supabase environment or documented SQL-editor process.
- [ ] Run RLS checks with renter, mitra, and admin accounts.
- [ ] Execute manual Android scenarios: signup/login, profile, vehicle search, unavailable dates, booking, order status, mitra operations, chat, notifications, review, logout/login.
- [ ] Execute web admin scenarios: login, dashboard, pagination, filters, moderation/status action, direct URL denial.
- [ ] Run `npx expo lint`, `npx tsc --noEmit`, `npx expo-doctor`, `npx expo export --platform web`, and `npx expo export --platform android`.
- [ ] Document remaining external setup: OAuth credentials, EAS credentials, and future payment gateway.

## Checkpoints

### Checkpoint A: Backend and identity

- [ ] Tasks 1–3 complete.
- [ ] Clean migration/seed works.
- [ ] Auth profile and role are real.
- [ ] Lint/typecheck pass.

### Checkpoint B: Core rental operations

- [ ] Tasks 4–6 complete.
- [ ] Availability prevents conflicting booking.
- [ ] Renter and mitra can complete their respective core flows.

### Checkpoint C: Release candidate

- [ ] Tasks 7–9 complete.
- [ ] Admin web route is protected and data-backed.
- [ ] No production mock/fallback paths remain.
- [ ] Android and web exports pass with documented external configuration.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Existing schema does not support atomic availability | High | Add a migration/RPC before changing calendar UI; verify concurrent attempts. |
| Existing navigation is native-first | Medium | Keep shared screens and add a narrow web admin entry/guard rather than restructure the app. |
| Seed records need Auth ownership | High | Separate public seed data from Auth bootstrap; never seed passwords. |
| OAuth/provider setup is external | Medium | Document exact redirect/provider setup and test only after credentials are configured. |
| TypeScript/Node incompatibility | Medium | Capture toolchain versions and use the project-compatible command/runtime before release claims. |
