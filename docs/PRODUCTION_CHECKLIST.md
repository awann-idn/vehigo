# Vehigo Production Checklist

Panduan ini adalah langkah wajib sebelum aplikasi diuji end-to-end di perangkat nyata.

## 1. Database

Jalankan migration berikut di Supabase SQL Editor dengan opsi **Enable RLS**
(jangan memakai "Run without RLS"), berurutan:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_rls.sql
supabase/migrations/0003_reviews.sql
supabase/migrations/0004_order_transitions.sql
supabase/migrations/0005_release_booking.sql
supabase/migrations/0006_availability_visibility.sql
supabase/migrations/0007_atomic_booking_security.sql
supabase/migrations/0008_production_hardening.sql
```

`0008` menambahkan:

- view terbatas `profile_directory` (nama + avatar) agar nama penyewa/mitra tampil tanpa membocorkan nomor telepon,
- notifikasi otomatis untuk pesanan, status pesanan, chat, dan hasil inspeksi,
- RPC `mark_chat_read`,
- `transition_order_status` sebagai `security definer` agar riwayat status bisa ditulis,
- default nama usaha mitra.

Setelah migration, jalankan `supabase/seed.sql` dan `supabase/seed_testing_mitra.sql`
bila membutuhkan data uji.

## 2. Auth

Di Supabase Dashboard → Authentication:

- **URL Configuration** → Site URL: URL web yang dipakai (mis. `http://localhost:8081/`).
- Redirect URLs: tambahkan `http://localhost:8081/` dan `vehigo://auth/callback`.
- Untuk uji cepat, nonaktifkan "Confirm email" atau konfirmasi email setiap akun uji.
- Provider Google/Facebook harus punya Client ID/Secret yang valid sebelum dipakai.

Akun admin dibuat manual:

```sql
update public.profiles
set role = 'admin'
where id = '<uuid-user-admin>';
```

## 3. Environment

File `.env` harus berisi:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Jangan pernah memakai service-role key di aplikasi klien.

## 4. Perintah verifikasi

```bash
npm run lint
npm run typecheck
npx expo-doctor
npx expo export --platform android
npx expo export --platform web
```

Catatan: Node 24 dapat overflow pada `tsc` default. Script `npm run typecheck`
sudah menaikkan stack size dan harus lulus tanpa error.

## 5. Skenario uji wajib

### Penyewa

1. Daftar → konfirmasi email → login.
2. Lengkapi profil (nama, WhatsApp) dan unggah KTP/SIM.
3. Cari kendaraan → buka detail → pilih tanggal (tanggal terblokir/pesanan lain tidak bisa dipilih).
4. Checkout → pesanan dibuat berstatus **Belum Bayar**.
5. Buka detail pesanan → hubungi mitra (chat benar-benar tersimpan).
6. Setelah mitra mengonfirmasi, status menjadi **Berlangsung**.
7. Akhiri pemakaian → unggah foto → kirim hasil pengecekan.
8. Setelah mitra menyelesaikan pesanan, beri rating kendaraan/mitra.
9. Notifikasi muncul untuk perubahan status dan pesan baru.

### Mitra

1. Daftar → pilih peran Mitra → isi 5 langkah registrasi (identitas, legalitas, alamat, kontak, rekening).
2. Data usaha dan rekening tersimpan; profil menampilkan status verifikasi yang sebenarnya.
3. Tambah kendaraan → ubah kendaraan → kelola tanggal blokir.
4. Pesanan masuk → konfirmasi (Belum Bayar → Berlangsung) → selesaikan (Berlangsung → Selesai).
5. Chat dengan penyewa dari detail pesanan.
6. Notifikasi pesanan baru dan pesan masuk.

### Admin (web)

1. Login akun ber-role `admin` → diarahkan ke Dashboard Admin.
2. Verifikasi/tolak mitra yang menunggu.
3. Lihat pesanan terbaru dan daftar pengguna.
4. Suspend/aktifkan pengguna.

## 6. Belum termasuk (ditunda)

- Payment gateway otomatis. Saat ini pesanan hanya berstatus menunggu pembayaran; tidak ada klaim lunas.
- Penyimpanan foto kendaraan ke kolom kendaraan (foto saat ini diunggah ke Storage tetapi belum ditampilkan di kartu kendaraan).
- Push notification native (notifikasi saat ini tersimpan di database dan tampil di aplikasi).
- Pencairan dana mitra otomatis.
