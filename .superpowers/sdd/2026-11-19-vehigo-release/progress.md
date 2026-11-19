# SDD ledger — plan: docs/superpowers/plans/2026-11-19-vehigo-release.md

Pre-flight: existing working tree contains prior Vehigo implementation changes; preserve them and build incrementally without resetting unrelated files.
Pre-flight: Task 1 produces the mock-usage inventory and production-path cleanup; Task 2 consumes database/API boundaries and produces authoritative seed/availability contracts; Task 3 consumes Task 2 profiles/roles; Tasks 4–7 consume those contracts; Task 8 consumes Task 2 admin authorization and Task 3 session state; Task 9 consumes all prior slices.
Task 1: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Ruling: order/vehicle relational fields use empty values when the database relation is unavailable rather than hardcoded demo identity; this prevents false data but requires the schema joins in the next backend task.
Task 2: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Ruling: the release seed keeps deterministic business data but requires real Auth mitra profile UUIDs; passwords are never represented in SQL. Booking writes now require the 0005 RPC, so an unapplied migration fails explicitly instead of allowing client-controlled totals or conflicts.
Task 3: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Ruling: anonymous guest login is disabled for the release path because it creates a session without a meaningful profile identity and conflicts with the no-demo requirement; the existing UI action now explains that login/signup is required.
Task 4: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Ruling: checkout no longer adds an insurance fee that the database/RPC does not model; the displayed total now matches the authoritative rental subtotal until a real fee model is added.
Task 5: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Ruling: deferred external payment means the app records/reads only pending state; hardcoded VA and client-side transition to berlangsung were removed to avoid a false payment confirmation.
Task 6: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Task 7: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit -> pass)
Task 8: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit && npx expo export --platform web -> pass)
Ruling: admin v1 is intentionally a data-backed protected dashboard summary in the existing Expo web route; detailed moderation tables remain the next release-hardening slice rather than shipping static admin screens.
Task 9: complete (commits pending in existing working tree, tests: npx expo lint && npx tsc --noEmit && npx expo-doctor && npx expo export --platform web && npx expo export --platform android -> pass; expo-doctor 20/20)
Final review: self-review (no fresh reviewer dispatched; native execution selected)
Deferred external verification: run migrations 0001-0005 and seed against Supabase, create real admin/mitra/renter accounts, configure OAuth/EAS, and execute manual Android/web QA.

Production hardening session:
- Fixed TanStack Query v5 runtime crash caused by queryFns returning undefined (chat thread, order detail, vehicle detail now return null).
- Fixed mitra chat navigation to use chat id from getOrCreateChat instead of order id; removed hardcoded chat id in OwnerAlerts.
- Added 0008_production_hardening.sql: profile_directory view, notification triggers, mark_chat_read RPC, security-definer transition_order_status, past-date booking validation.
- Wired mitra registration persistence (mitra_profiles, profiles, payout account) and added OwnerBusinessProfile edit screen.
- Added vehicle edit + mitra date-blocking screen; removed mock.ts.
- Admin web now lists pending mitras, recent orders, users with verify/suspend actions.
- Renter identity upload screen, real profile edit, real vehicle ratings, real dashboard/profile stats, notifications relative time.
- Added npm run typecheck (node stack size) because Node 24 overflows tsc default stack; tsc itself is clean.
- Verification: expo lint, npm run typecheck, expo-doctor 20/20, expo export android/web all pass.
- Remaining external: apply migrations 0001-0008, configure auth URLs, manual device QA, payment gateway (deferred).
