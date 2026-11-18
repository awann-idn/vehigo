# Vehigo Production Design

## Status
Accepted — 2026-11-18

## Context
Vehigo saat ini adalah aplikasi Expo/React Native dengan seluruh layar Mitra dan Penyewa sudah terbangun, tetapi memakai data mock dan belum memiliki backend, autentikasi, pembayaran, chat, notifikasi, maupun jalur rilis. Target: aplikasi siap production dan dapat dirilis ke Play Store/App Store.

## Goals
- Backend nyata (Supabase) sebagai sumber data tunggal, menggantikan `src/data/mock.ts`.
- Autentikasi email/password + role (`penyewa`, `mitra`, `admin`).
- Alur inti berfungsi end-to-end: registrasi mitra, armada, booking, pembayaran, pesanan, inspeksi, rating, chat.
- Keamanan data: RLS per role, storage privat, secret key tidak pernah di client.
- Rilis: EAS build + submit, environment staging/production, monitoring.

## Non-goals (saat ini)
- OTP WhatsApp (ditunda; siapkan titik integrasi).
- Aplikasi admin web penuh (mulai dari Supabase Studio).
- Multi-bahasa penuh (Indonesia dulu).
- Fitur sosial/feed di luar prototype.

## Constraints
- Expo SDK ~58, React Native 0.88, TypeScript, React Navigation 7.
- Supabase project: `fbzksxwqxkdgokvsqekx`.
- Client hanya memakai **publishable key**. **Secret key** hanya untuk Edge Function/admin dan tidak masuk repo.
- Tidak menambah aset gambar ke `src/`; foto user diunggah ke Supabase Storage.

## Architecture
- **Client:** Expo app + `@supabase/supabase-js` (auth, database, storage, realtime).
- **Server state:** `@tanstack/react-query`; client state ringan: Zustand/Context.
- **Forms:** `react-hook-form` + `zod`.
- **Sensitive operations:** Supabase Edge Functions (Deno) — pembuatan order, validasi harga, webhook pembayaran, verifikasi dokumen, notifikasi.
- **Auth:** Supabase Auth email/password; sesi di `expo-secure-store`.
- **Storage buckets (privat):** `ktp`, `sim`, `vehicle-photos`, `payment-proofs`.
- **Realtime:** Supabase Realtime channel untuk `messages`.
- **Admin:** Supabase Studio + service role untuk operasi manual; panel web menyusul.

## Data Model (inti)
- `profiles` (1:1 auth.users): nama, telepon, avatar_url, role, status.
- `mitra_profiles`: nama usaha, alamat, koordinat, status verifikasi, metode payout.
- `vehicles`: mitra_id, nama, plat, tahun, transmisi, kapasitas, harga/hari, status.
- `vehicle_availability`: vehicle_id, tanggal, status blokir.
- `orders`: penyewa_id, mitra_id, vehicle_id, tanggal, total, status, kode.
- `order_status_history`: order_id, status, actor_id, catatan.
- `payments`: order_id, provider, metode, nominal, status, external_id.
- `inspections`: order_id, foto, temuan, denda, status persetujuan.
- `reviews`: order_id, penulis, target (vehicle/mitra), rating, isi.
- `chats` + `messages`: partisipan, isi, tipe (teks/darurat), read_at.
- `notifications`: user_id, judul, isi, tipe, read_at.
- `documents`: user_id, jenis (ktp/sim/nib), storage_path, status.
- `payouts`: mitra_id, order_id, nominal, status.

## Security
- RLS aktif di semua tabel; policy berdasarkan `auth.uid()` dan role.
- Storage privat; akses via signed URL berumur pendek.
- Secret key hanya di Edge Functions (environment Supabase), tidak di app/repo.
- Validasi harga dan transisi status hanya di Edge Function, bukan client.
- Rate limit + validasi input di Edge Function.
- Audit log untuk perubahan status order.

## Frontend Changes
- Hapus ketergantungan `src/data/mock.ts` bertahap; ganti dengan hooks React Query.
- Auth context + route guard (`AuthStack` vs `OwnerApp`/`RenterApp`).
- Loading/empty/error state konsisten di semua layar.
- Upload dokumen & foto kendaraan via image picker + kompresi.
- Push notification (Expo Notifications) dan deep link.

## Release
- `eas.json` dengan profil `development`, `preview`, `production`.
- App config: nama `Vehigo`, slug, bundle ID/package `com.vehigo.app`.
- Environment: `.env` lokal (gitignored) + EAS secrets.
- Publish: EAS Build → EAS Submit (Play Console/App Store).

## Open Questions
- Akun Expo/EAS: login dengan email pemilik (dilakukan manual oleh user).
- Provider OTP WhatsApp (nanti).
- Payment gateway (nanti).
