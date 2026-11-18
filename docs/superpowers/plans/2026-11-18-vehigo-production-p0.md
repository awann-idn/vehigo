# Vehigo Production Implementation Plan (P0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Membangun fondasi production: Supabase client, schema + RLS, state/form libraries, environment, dan konfigurasi EAS.

**Architecture:** Supabase sebagai backend (Postgres/Auth/Storage/Realtime/Edge Functions). Client memakai publishable key + RLS. Operasi sensitif lewat Edge Function.

**Tech Stack:** Expo ~58, @supabase/supabase-js, @tanstack/react-query, react-hook-form, zod, zustand, expo-secure-store.

**Spec:** `docs/superpowers/specs/2026-11-18-vehigo-production-design.md`

## Global Constraints
- Secret key (`sb_secret_...`) tidak boleh ada di repo, `.env` client, atau bundle.
- Client env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (publishable).
- Semua tabel wajib RLS.
- `npx tsc --noEmit` dan `npx expo lint` harus bersih di setiap task.

## Review Focus
- RLS bocor antar mitra/penyewa (akses data orang lain).
- Harga/total order dimanipulasi dari client.
- Sesi auth hilang setelah restart.
- Upload dokumen tanpa proteksi akses.
- Status order tidak konsisten (transisi ilegal).

---

### Task P0.1: Dependencies & environment
**Files:** `package.json`, `.env.example`, `.env` (lokal, gitignored), `src/lib/env.ts`

- [ ] `npx expo install @supabase/supabase-js @tanstack/react-query react-hook-form zod zustand expo-secure-store`
- [ ] Tambah `.env.example`: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Isi `.env` lokal dengan URL project + publishable key (bukan secret).
- [ ] `src/lib/env.ts` membaca dan memvalidasi env (lempar error jelas jika kosong).
- [ ] Typecheck + lint.

### Task P0.2: Supabase client & query provider
**Files:** `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `App.tsx`

- [ ] Client `supabase` dengan `auth.storage: SecureStore` adapter dan `autoRefreshToken`.
- [ ] `QueryClient` dengan retry terbatas dan staleTime.
- [ ] Wrap `App` dengan `QueryClientProvider`.
- [ ] Typecheck + lint.

### Task P0.3: Database schema + RLS
**Files:** `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_rls.sql`, `supabase/seed.sql`

- [ ] Enums: `user_role`, `order_status`, `payment_status`, `vehicle_status`, `doc_status`.
- [ ] Tabel sesuai design doc + index + FK + `created_at/updated_at`.
- [ ] Trigger `handle_new_user` untuk membuat `profiles` dari `auth.users`.
- [ ] RLS + policy per role (profiles, mitra_profiles, vehicles, orders, payments, messages, notifications, documents).
- [ ] Seed minimal untuk staging.
- [ ] Instruksi menjalankan SQL di Supabase SQL Editor (DDL tidak bisa via publishable/secret key REST).

### Task P0.4: Typed API layer
**Files:** `src/lib/database.types.ts`, `src/hooks/*`

- [ ] Generate tipe DB (atau tulis manual dari schema).
- [ ] Buat hooks awal: `useVehicles`, `useOrders`, `useProfile` dengan React Query.
- [ ] Ganti satu layar (OwnerFleet) dari mock ke Supabase sebagai pilot.

### Task P0.5: EAS & app config
**Files:** `eas.json`, `app.json`

- [ ] `app.json`: name `Vehigo`, slug `vehigo`, ios bundleId & android package `com.vehigo.app`.
- [ ] `eas.json`: profil development/preview/production.
- [ ] Instruksi `npx eas-cli login` (manual oleh pemilik akun) dan `eas build -p android --profile preview`.

## Phase berikutnya (ringkas)
- P1 Auth + guard + profil + upload KTP/SIM.
- P2 Vehicles + availability + orders (Edge Function untuk harga/transisi status).
- P3 Payment (Midtrans/Xendit) + webhook idempotent.
- P4 Chat realtime + push notification + deep link.
- P5 Admin (verifikasi, refund, sengketa).
- P6 Test + CI + rilis store.
