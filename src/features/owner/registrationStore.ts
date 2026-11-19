import { create } from 'zustand';

export type PayoutMethod = 'bank' | 'ewallet';

export interface RegistrationData {
  ownerName: string;
  businessName: string;
  nib: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
  payoutMethod: PayoutMethod;
  accountNumber: string;
  accountHolder: string;
}

const initial: RegistrationData = {
  ownerName: '',
  businessName: '',
  nib: '',
  npwp: '',
  address: '',
  phone: '',
  email: '',
  payoutMethod: 'bank',
  accountNumber: '',
  accountHolder: '',
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
