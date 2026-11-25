export type ChatThread = { id: string; name: string; lastMessage: string; time: string; unread: number; online: boolean; phone?: string; counterpartId?: string; orderId?: string };
export type ChatMessage = { id: string; fromMe: boolean; text: string; time: string; read?: boolean };
export type NotificationItem = { id: string; title: string; body: string; time: string; tone: 'success' | 'info' | 'warning'; read?: boolean; linkType?: 'chat' | 'order' | null; linkId?: string | null; category?: 'order' | 'chat' | 'promo'; createdAt?: string };
export type OrderStatus = 'Belum Bayar' | 'Menunggu Konfirmasi' | 'Berlangsung' | 'Selesai' | 'Denda' | 'Dibatalkan' | 'Draft WhatsApp';
export type Order = { id: string; code: string; renter: string; vehicle: string; plate: string; start: string; end: string; days: number; total: number; status: OrderStatus; payment: string; phone: string; renterId?: string; vehicleId?: string; mitraId?: string; mitraName?: string };
export type VehicleStatus = 'Tersedia' | 'Disewa' | 'Maintenance';
export type Vehicle = { id: string; name: string; brand: string; year: number; plate: string; pricePerDay: number; status: VehicleStatus; transmission: 'Manual' | 'Matic'; seats: number; rating: number; mitra: string; location: string; tint: string; mitraId?: string };
