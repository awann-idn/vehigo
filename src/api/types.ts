export type ChatThread = { id: string; name: string; lastMessage: string; time: string; unread: number; online: boolean };
export type ChatMessage = { id: string; fromMe: boolean; text: string; time: string };
export type NotificationItem = { id: string; title: string; body: string; time: string; tone: 'success' | 'info' | 'warning' };
export type OrderStatus = 'Belum Bayar' | 'Berlangsung' | 'Selesai' | 'Denda' | 'Dibatalkan' | 'Draft WhatsApp';
export type Order = { id: string; code: string; renter: string; vehicle: string; plate: string; start: string; end: string; days: number; total: number; status: OrderStatus; payment: string; phone: string; renterId?: string; vehicleId?: string; mitraId?: string; mitraName?: string };
export type VehicleStatus = 'Tersedia' | 'Disewa' | 'Maintenance';
export type Vehicle = { id: string; name: string; brand: string; year: number; plate: string; pricePerDay: number; status: VehicleStatus; transmission: 'Manual' | 'Matic'; seats: number; rating: number; mitra: string; location: string; tint: string; mitraId?: string };
