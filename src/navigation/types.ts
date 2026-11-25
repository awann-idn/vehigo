export type RootStackParamList = {
  LogoSplash: undefined;
  Splash: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Login: undefined;
  SignUp: undefined;
  PilihRole: undefined;
  OwnerReg1: undefined;
  OwnerReg2: undefined;
  OwnerReg3: undefined;
  OwnerReg4: undefined;
  OwnerReg5: undefined;
  OwnerVerification: undefined;
  OwnerBusinessProfile: undefined;
  OwnerApp: undefined;
  RenterApp: undefined;
  AdminApp: undefined;
  OwnerOrderDetail: { id: string };
  OwnerVehicleDetail: { id: string };
  OwnerAvailability: { id: string };
  OwnerAddVehicle: { id?: string } | undefined;
  OwnerChatDetail: { id: string };
  VehicleDetail: { id: string };
  SearchResults: undefined;
  MitraProfile: { id: string };
  Reviews: undefined;
  BookingGateway: { vehicleId: string; startDate?: string; endDate?: string };
  BookingIdentity: { vehicleId: string; startDate?: string; endDate?: string };
  BookingCheckout: { vehicleId: string; startDate?: string; endDate?: string };
  BookingPayment: { vehicleId: string; orderId?: string; total?: number };
  RenterOrderDetail: { id: string };
  Inspection: { id: string };
  Rating: { id: string };
  ChatDetail: { id: string };
  Terms: undefined;
  RenterProfileEdit: undefined;
  RenterVerification: undefined;
  DatePicker: { vehicleId?: string };
  AppSettings: undefined;
  HelpCenter: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  Pesanan: undefined;
  Armada: undefined;
  Chat: undefined;
  Alerts: undefined;
};

export type RenterTabParamList = {
  Home: undefined;
  Pesanan: undefined;
  Chat: undefined;
  Notifikasi: undefined;
  Profil: undefined;
};
