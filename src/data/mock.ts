export type VehicleStatus = 'Tersedia' | 'Disewa' | 'Maintenance';

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  year: number;
  plate: string;
  pricePerDay: number;
  status: VehicleStatus;
  transmission: 'Manual' | 'Matic';
  seats: number;
  rating: number;
  mitra: string;
  location: string;
  tint: string;
};

export type OrderStatus =
  | 'Belum Bayar'
  | 'Berlangsung'
  | 'Selesai'
  | 'Denda'
  | 'Dibatalkan'
  | 'Draft WhatsApp';

export type Order = {
  id: string;
  code: string;
  renter: string;
  vehicle: string;
  plate: string;
  start: string;
  end: string;
  days: number;
  total: number;
  status: OrderStatus;
  payment: string;
  phone: string;
};

export type Mitra = {
  id: string;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  units: number;
  orders: number;
  years: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: 'success' | 'info' | 'warning';
};

export type ChatThread = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  body: string;
  date: string;
};

export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Toyota Avanza 2023',
    brand: 'Toyota',
    year: 2023,
    plate: 'BG 1234 AVZ',
    pricePerDay: 350000,
    status: 'Tersedia',
    transmission: 'Matic',
    seats: 7,
    rating: 4.9,
    mitra: 'Sriwijaya Rent Car',
    location: 'Palembang',
    tint: '#DFE7F5',
  },
  {
    id: 'v2',
    name: 'Mitsubishi Xpander',
    brand: 'Mitsubishi',
    year: 2022,
    plate: 'BG 8821 XP',
    pricePerDay: 400000,
    status: 'Disewa',
    transmission: 'Matic',
    seats: 7,
    rating: 4.8,
    mitra: 'Sriwijaya Rent Car',
    location: 'Palembang',
    tint: '#F3E4D7',
  },
  {
    id: 'v3',
    name: 'BMW 5 Series G30',
    brand: 'BMW',
    year: 2021,
    plate: 'BG 1234 AER',
    pricePerDay: 1250000,
    status: 'Tersedia',
    transmission: 'Matic',
    seats: 5,
    rating: 5.0,
    mitra: 'Sriwijaya Rent Car',
    location: 'Palembang',
    tint: '#DCE7E1',
  },
  {
    id: 'v4',
    name: 'Fortuner 2019',
    brand: 'Toyota',
    year: 2019,
    plate: 'BG 1234 FR',
    pricePerDay: 750000,
    status: 'Maintenance',
    transmission: 'Matic',
    seats: 7,
    rating: 4.7,
    mitra: 'Sriwijaya Rent Car',
    location: 'Palembang',
    tint: '#EAE3F2',
  },
  {
    id: 'v5',
    name: 'Honda Brio 2023',
    brand: 'Honda',
    year: 2023,
    plate: 'BG 5566 BR',
    pricePerDay: 275000,
    status: 'Tersedia',
    transmission: 'Manual',
    seats: 5,
    rating: 4.6,
    mitra: 'BMS Rent Car',
    location: 'Palembang',
    tint: '#F6E7E7',
  },
];

export const ownerOrders: Order[] = [
  {
    id: 'o1',
    code: '#PKP-2026042507',
    renter: 'Siti Rahma J',
    vehicle: 'BMW 5 Series G30',
    plate: 'BG 1234 AER',
    start: '10 Jan 2026',
    end: '13 Jan 2026',
    days: 3,
    total: 4250000,
    status: 'Berlangsung',
    payment: 'Virtual Account BNI',
    phone: '081234567890',
  },
  {
    id: 'o2',
    code: '#PKP-2026042501',
    renter: 'Budi Santoso',
    vehicle: 'Toyota Avanza 2023',
    plate: 'BG 1234 AVZ',
    start: '12 Jan 2026',
    end: '14 Jan 2026',
    days: 2,
    total: 800000,
    status: 'Belum Bayar',
    payment: 'Virtual Account BRI',
    phone: '081298765432',
  },
  {
    id: 'o3',
    code: '#TRX-2026-00124',
    renter: 'Hari Wijaya',
    vehicle: 'Fortuner 2019',
    plate: 'BG 1234 FR',
    start: '10 Jan 2026',
    end: '12 Jan 2026',
    days: 2,
    total: 1500000,
    status: 'Selesai',
    payment: 'E-Wallet GoPay',
    phone: '081311223344',
  },
  {
    id: 'o4',
    code: '#TRX-2026-00111',
    renter: 'Yolanda Putri',
    vehicle: 'Mitsubishi Xpander',
    plate: 'BG 8821 XP',
    start: '12 Jan 2026',
    end: '15 Jan 2026',
    days: 3,
    total: 1200000,
    status: 'Denda',
    payment: 'Transfer Bank Mandiri',
    phone: '081355667788',
  },
  {
    id: 'o5',
    code: '#TRX-2026-00189',
    renter: 'Taki Nakahara',
    vehicle: 'Toyota Avanza 2023',
    plate: 'BG 1234 AVZ',
    start: '12 Jan 2026',
    end: '13 Jan 2026',
    days: 1,
    total: 350000,
    status: 'Draft WhatsApp',
    payment: 'WhatsApp',
    phone: '081399001122',
  },
];

export const renterOrders: Order[] = [
  ownerOrders[1],
  ownerOrders[0],
  {
    ...ownerOrders[2],
    renter: 'Anda',
    vehicle: 'Toyota Avanza 2023',
  },
];

export const mitras: Mitra[] = [
  { id: 'm1', name: 'Sriwijaya Rent Car', distance: '2.4 km', rating: 4.8, reviews: 842, units: 24, orders: 2400, years: 7 },
  { id: 'm2', name: 'BMS Rent Car', distance: '3.1 km', rating: 4.7, reviews: 512, units: 12, orders: 1200, years: 5 },
  { id: 'm3', name: 'Palembang Premium Car', distance: '4.0 km', rating: 4.9, reviews: 301, units: 8, orders: 860, years: 4 },
  { id: 'm4', name: 'Vehicle Rent Go', distance: '5.2 km', rating: 4.6, reviews: 208, units: 6, orders: 540, years: 3 },
];

export const reviews: Review[] = [
  { id: 'r1', author: 'Rizky A.', rating: 5, body: 'Mobil sangat bersih dan performa mesin luar biasa. Proses serah terima sangat profesional.', date: '08/12/26' },
  { id: 'r2', author: 'Dewi S.', rating: 5, body: 'Layanan jemput tepat waktu. Mobilnya irit banget buat keliling kota. Next bakal order disini lagi.', date: '05/12/26' },
  { id: 'r3', author: 'Bambang P.', rating: 4, body: 'AC dingin, suspensi nyaman. Hanya saja unit sedikit terlambat datang.', date: '02/12/26' },
];

export const ownerNotifications: NotificationItem[] = [
  { id: 'n1', title: 'Status Pesanan', body: 'Pesanan Toyota Avanza Anda telah dikonfirmasi oleh Mitra.', time: 'HARI INI', tone: 'success' },
  { id: 'n2', title: 'Penawaran Eksklusif', body: 'Diskon 20% khusus sewa akhir pekan di Palembang! Gunakan kode: PALEMBANGSERU', time: 'HARI INI', tone: 'info' },
  { id: 'n3', title: 'Keamanan Akun', body: 'Verifikasi dokumen Anda telah berhasil. Akun Anda kini siap untuk pemesanan lebih lanjut.', time: 'KEMARIN', tone: 'info' },
];

export const chatThreads: ChatThread[] = [
  { id: 'c1', name: 'Yolanda Putri', lastMessage: 'Saya kirim bukti transfer ya', time: '09:41', unread: 2, online: true },
  { id: 'c2', name: 'Budi Santoso', lastMessage: 'Titik penjemputannya ada di depan Pak', time: '09:12', unread: 0, online: true },
  { id: 'c3', name: 'Taki Nakahara', lastMessage: 'Saya sudah di lokasi pengembalian', time: '08/12/26', unread: 1, online: false },
  { id: 'c4', name: 'Sriwijaya Rent Car', lastMessage: 'Thanks for the smooth rental experience!', time: 'Kemarin', unread: 0, online: false },
];

export type ChatMessage = { id: string; fromMe: boolean; text: string; time: string };

export const chatMessages: ChatMessage[] = [
  { id: 'm1', fromMe: false, text: 'Halo! Selamat siang. Apakah Bapak mau memesan mobil Toyota Avanza untuk tanggal 25 Desember?', time: '09:30' },
  { id: 'm2', fromMe: true, text: 'Siang juga Pak. Betul Pak. Kondisinya aman?', time: '09:32' },
  { id: 'm3', fromMe: false, text: 'Untuk kondisi kita sudah ada fitur 360 ya Pak, bisa dilihat juga detail kondisinya.', time: '09:33' },
  { id: 'm4', fromMe: true, text: 'Baik, saya ambil yang itu. Tolong siapkan unitnya ya.', time: '09:35' },
];

export const formatRupiah = (value: number): string =>
  'Rp ' + value.toLocaleString('id-ID');
