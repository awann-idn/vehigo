# Vehigo Release Design

## Intent

Menyiapkan Vehigo untuk rilis Android dan dashboard admin berbasis web dalam repo Expo yang sama. Supabase menjadi sumber data tunggal untuk identitas pengguna, mitra, kendaraan, availability, booking, order, chat, notifikasi, inspeksi, review, dan operasi admin.

## Goals

- Tidak ada data dummy atau fallback mock pada alur produksi.
- Data mitra dan kendaraan awal berasal dari data yang sudah ada di proyek dan dimasukkan melalui migration/seed yang idempotent.
- Login menampilkan profil pengguna nyata dan role yang benar.
- Kalender booking membaca availability dan order aktif dari Supabase serta mencegah bentrok.
- Alur renter dan mitra tersimpan serta terbaca ulang dari Supabase.
- Dashboard admin tersedia sebagai route web di repo yang sama dan hanya dapat diakses oleh role admin.
- Build Android dan web admin dapat diverifikasi melalui release gate.

## Non-goals

- Payment gateway eksternal sungguhan pada fase ini.
- OTP WhatsApp.
- Aplikasi iOS pada fase rilis ini.
- Fitur sosial di luar alur rental.

Pembayaran akan memiliki status internal yang jujur seperti pending/manual_review/cancelled; aplikasi tidak boleh menyatakan pembayaran gateway berhasil tanpa integrasi dan bukti yang valid.

## Constraints

- Styling, layout, warna, dan struktur visual layar yang sudah ada dipertahankan.
- Dashboard admin dibuat sebagai route web pada repo Expo yang sama.
- Client hanya memakai publishable/anon key; service-role key hanya boleh berada di server/Edge Function dan tidak masuk repo atau bundle.
- Semua tabel produksi memiliki RLS.
- Akun Auth tidak dibuat dengan password hardcoded melalui migration. Seed data memakai profile/relasi yang aman dan instruksi bootstrap admin/mitra.
- Migration dapat dijalankan berurutan pada database kosong dan seed dapat diulang tanpa duplikasi.

## Approaches

### A. Expo Web route admin — dipilih

Admin route hidup di repo dan layer aplikasi yang sama, memakai Supabase client, tipe database, auth, serta guard bersama. Ini paling cepat dan menjaga kontrak data tetap satu. Boundary admin dibuat eksplisit melalui route guard dan API/hooks admin.

### B. Package web admin terpisah

Memberi fleksibilitas tabel web lebih besar, tetapi menambah konfigurasi, dependency, dan permukaan deployment sebelum alur inti mobile stabil. Tidak dipilih untuk fase ini.

## Architecture

```text
Android Expo app + Expo Web admin routes
              │
              ├── shared auth/session/query/types
              ├── renter and mitra flows
              └── admin routes and admin data hooks
              │
              └── Supabase Auth + Postgres + Storage + Realtime
```

Database adalah sumber kebenaran. Client tidak menghitung atau mempercayai harga, availability, role, atau transisi status secara sepihak; validasi penting dilakukan lewat constraint/RPC/Edge Function sesuai kebutuhan yang sudah ada.

## Release slices

1. Audit semua penggunaan `src/data/mock.ts`, hardcoded identity, placeholder action, dan fallback error.
2. Perkuat schema, RLS, availability, order conflict, status history, dan seed data mitra/kendaraan dari mock yang ada.
3. Selesaikan auth/profile/role guard sehingga user nyata selalu tampil dan route sesuai role.
4. Selesaikan vehicle/mitra listing dan kalender availability nyata.
5. Selesaikan booking, order, payment-internal, dan status transition end-to-end.
6. Selesaikan flow mitra: fleet, order, inspection, dan review.
7. Selesaikan chat realtime dan notifikasi database.
8. Bangun route admin web: login, dashboard, users, mitras, vehicles, orders, verification/audit.
9. Hapus mock/fallback produksi dan tambahkan empty/loading/error state.
10. Jalankan security audit, migration-from-empty verification, Android build, web export, dan QA manual.

## Acceptance criteria

- `src/data/mock.ts` tidak dipakai untuk menampilkan data pada route produksi.
- Login/signup/logout dan session restore menampilkan nama, avatar, dan role dari profile nyata.
- Kalender menandai tanggal bentrok berdasarkan order/availability database dan create order gagal secara aman bila terjadi race.
- Renter dapat membuat dan melihat order; mitra hanya melihat order kendaraan miliknya; admin dapat melihat data sesuai kewenangan.
- Tidak ada UI yang menampilkan sukses ketika operasi backend gagal.
- Seed berisi seluruh data awal yang disepakati dari proyek dan dapat dijalankan ulang.
- RLS mencegah akses silang renter/mitra dan membatasi operasi admin.
- Dashboard admin dapat dibuka di web, dilindungi role admin, dan seluruh tabel/statistik berasal dari Supabase.
- `npx expo lint`, `npx tsc --noEmit`, `npx expo-doctor`, web export, dan Android export lulus atau memiliki blocker terdokumentasi.

## External setup required

- Supabase migrations dijalankan pada project target.
- Provider OAuth hanya dianggap selesai setelah credential dan redirect URL valid.
- Akun admin dan mitra bootstrap dibuat lewat Supabase Auth lalu profile role ditetapkan secara aman.
- EAS Android credentials dan Play Console setup dilakukan oleh pemilik akun.

## Open decisions resolved

- Target rilis: Android + web admin.
- Admin: route web dalam repo Expo yang sama.
- Payment gateway: ditunda, tetapi status pembayaran harus jujur dan tidak mock.
- Data seed: berasal dari data proyek yang sudah ada.
