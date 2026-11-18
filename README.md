# Vehigo

Aplikasi mobile rental kendaraan berbasis Expo/React Native dengan dua peran: **Penyewa** (mencari dan menyewa kendaraan) dan **Mitra/Owner** (mendaftarkan dan mengelola armada rental).

Seluruh layar dan alur dibangun mengikuti prototipe Figma **Vehigo / UI-UX**. Semua ilustrasi dan ikon dibuat dengan vektor/kode (`lucide-react-native` + komponen React Native) — tidak ada aset gambar di dalam kode aplikasi.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm start

# 3. Buka di platform tujuan
npm run android
npm run ios
npm run web
```

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Menjalankan Expo dev server |
| `npm run android` | Menjalankan aplikasi di Android |
| `npm run ios` | Menjalankan aplikasi di iOS |
| `npm run web` | Menjalankan aplikasi di web |
| `npx expo lint` | Lint (ESLint + Aturan Expo) |
| `npx tsc --noEmit` | Typecheck TypeScript |
| `npx expo export --platform android` | Verifikasi bundle produksi |

## Fitur & Alur

### Autentikasi
- Logo splash → Splash screen → Onboarding 1–3
- Login, Sign Up, login tamu, sosial login (vektor)
- Pilih Peran: Penyewa atau Mitra

### Mitra / Owner
- Registrasi 5 langkah: Identitas → Legalitas → Informasi Usaha (+ popup Syarat & Ketentuan) → Kontak → Keuangan
- Verifikasi identitas (KTP, wajah, nomor)
- Dashboard: KPI pendapatan/pesanan/armada/rating, insight, pesanan terbaru
- Armada: pencarian, filter status, detail kendaraan, tambah kendaraan (slot foto 360°)
- Pesanan: filter Semua/Belum Bayar/Berlangsung/Selesai/Denda/Draft WhatsApp + detail
- Notifikasi, chat, dan profil (ganti peran, logout)

### Penyewa
- Home: pencarian, rentang tanggal, Top Mitra, rekomendasi kendaraan
- Pencarian + filter (transmisi, kursi, harga) dan pemilih tanggal
- Detail kendaraan, profil mitra, ulasan
- Booking: Gateway → Identitas Penyewa → Checkout → Pembayaran
- Pesanan: filter status + detail pesanan
- Inspeksi pengembalian 3 langkah, rating 2 langkah
- Chat (termasuk status darurat), notifikasi, profil

## Arsitektur

```
src/
├── app/                 # (kosong) — routing memakai React Navigation
├── components/          # UI kit bersama: Screen, AppHeader, PrimaryButton,
│                        # TextField, SegmentedTabs, StatusBadge, Card,
│                        # Stepper, ListItem, EmptyState, OnboardingBits
├── data/mock.ts         # Data mock: kendaraan, pesanan, mitra, chat, ulasan
├── navigation/
│   ├── AppNavigator.tsx # Root stack
│   ├── OwnerTabs.tsx    # Bottom tabs mitra
│   ├── RenterTabs.tsx   # Bottom tabs penyewa
│   └── types.ts         # Tipe route & param list
├── screens/
│   ├── owner/           # Layar mitra + registrasi
│   └── renter/          # Layar penyewa
└── theme/               # colors, spacing, typography
```

- **Navigasi:** `@react-navigation/native-stack` untuk alur, `@react-navigation/bottom-tabs` untuk aplikasi utama per peran.
- **Desain:** token warna mengikuti Figma — `#30364F` (primary), `#1A2138` (teks), `#E3E4D2` (secondary), `#F6F3F5` (card).
- **Data:** seluruh layar memakai data mock lokal; tidak ada backend/API.
- **Aset:** tanpa PNG/JPG/SVG di `src/`; ikon dari `lucide-react-native`, ilustrasi dari shape React Native.

## Tech Stack

- Expo SDK ~58, React Native 0.88, React 19, TypeScript ~6
- React Navigation 7 (native-stack + bottom-tabs)
- `lucide-react-native`, `react-native-safe-area-context`, `react-native-screens`

## Dokumen

- Rencana implementasi lengkap (per fase, per layar + node ID Figma): [`docs/superpowers/plans/2026-11-18-vehigo-full-prototype.md`](docs/superpowers/plans/2026-11-18-vehigo-full-prototype.md)

## Catatan

- Prototipe sumber: file Figma "UI-UX" (section `OWNER` dan `PENYEWA (FILLAH)`).
- Layout saat ini mengikuti struktur, copy, warna, dan komponen prototipe; penyempurnaan pixel-perfect per layar dapat dilakukan dengan membandingkan langsung ke node Figma.
