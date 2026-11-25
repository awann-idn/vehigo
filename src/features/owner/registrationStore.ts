import { create } from 'zustand';

export type PayoutMethod = 'bank' | 'ewallet';
export type OperatingHour = { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string };
export type RentalTerm = { title: string; body: string };

export interface RegistrationData {
  ownerName: string;
  identityNumber: string;
  businessName: string;
  businessDescription: string;
  nib: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
  payoutMethod: PayoutMethod;
  accountNumber: string;
  accountHolder: string;
  operatingHours: OperatingHour[];
  terms: RentalTerm[];
}

const initial: RegistrationData = {
  ownerName: '',
  identityNumber: '',
  businessName: '',
  businessDescription: '',
  nib: '',
  npwp: '',
  address: '',
  phone: '',
  email: '',
  payoutMethod: 'bank',
  accountNumber: '',
  accountHolder: '',
  operatingHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, isOpen: dayOfWeek !== 0, openTime: '09:00', closeTime: '21:00' })),
  terms: [
    { title: 'Ketentuan penyewa', body: '' },
    { title: 'Durasi & keterlambatan', body: '' },
    { title: 'Penggunaan kendaraan', body: '' },
    { title: 'Bahan bakar & kebersihan', body: '' },
    { title: 'Asuransi & kerusakan', body: '' },
    { title: 'Pembatalan', body: '' },
    { title: 'Lainnya', body: '' },
  ],
};

interface RegistrationStore extends RegistrationData {
  update: (values: Partial<RegistrationData>) => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  ...initial,
  update: (values) => set(values),
  reset: () => set(initial),
}));
