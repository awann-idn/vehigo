# Vehigo Release Tasks

- [x] Task 1: Audit and remove production mock dependencies
- [x] Task 2: Make schema, security, availability, and seed release-ready
- [x] Task 3: Finish auth, profile hydration, and role guards
- [x] Checkpoint A: Backend and identity
- [x] Task 4: Make vehicle data and booking calendar realtime/authoritative
- [x] Task 5: Complete renter order and honest payment-internal flow
- [x] Task 6: Complete mitra fleet, order, inspection, and review operations
- [x] Checkpoint B: Core rental operations
- [x] Task 7: Finish realtime chat and database notifications
- [x] Task 8: Build the same-repo web admin route
- [x] Task 9: Release hardening, QA, and Android/web release artifacts
- [x] Checkpoint C: Release candidate

## Production hardening (lanjutan)

- [x] Fix TanStack Query crash (`undefined` query data) pada chat/order/vehicle detail
- [x] Perbaiki navigasi chat mitra (memakai `chat.id`, bukan `order.id`)
- [x] Persistensi registrasi mitra: profil usaha, kontak, rekening penerimaan
- [x] Edit profil mitra + edit kendaraan
- [x] Kelola tanggal blokir kendaraan oleh mitra
- [x] Notifikasi database otomatis (pesanan, status, chat, inspeksi)
- [x] View `profile_directory` agar nama tampil tanpa membocorkan kontak
- [x] Admin web: verifikasi mitra, daftar pesanan, suspend pengguna
- [x] Verifikasi identitas penyewa (unggah KTP/SIM)
- [x] Rating kendaraan dihitung dari ulasan nyata
- [x] Transisi status pesanan mitra (belum bayar → berlangsung → selesai)
- [x] Hapus `src/data/mock.ts` dan ID dummy
- [x] Script `npm run typecheck` yang tidak overflow di Node 24

## Wajib dijalankan pengguna

- [ ] Jalankan `supabase/migrations/0008_production_hardening.sql` (Enable RLS)
- [ ] Pastikan semua migration 0001–0008 sudah diterapkan
- [ ] Atur URL Auth + provider OAuth di Supabase
- [ ] Uji manual sesuai `docs/PRODUCTION_CHECKLIST.md`

## Figma functional implementation (new plan: tasks/plan.md)

- [ ] Phase 1: Mitra registration and persistence
- [ ] Phase 2: Mitra operations and navigation
- [ ] Phase 3: Renter operations and navigation
- [ ] Checkpoint: functional end-to-end flows
- [ ] Phase 4: final QA and exports
