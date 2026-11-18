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
  OwnerApp: undefined;
  RenterApp: undefined;
  OwnerOrderDetail: { id: string };
  OwnerVehicleDetail: { id: string };
  OwnerAddVehicle: undefined;
  OwnerChatDetail: { id: string };
  VehicleDetail: { id: string };
  SearchResults: undefined;
  MitraProfile: { id: string };
  Reviews: undefined;
  BookingGateway: { vehicleId: string };
  BookingIdentity: { vehicleId: string };
  BookingCheckout: { vehicleId: string };
  BookingPayment: { vehicleId: string };
  RenterOrderDetail: { id: string };
  Inspection: { id: string };
  Rating: { id: string };
  ChatDetail: { id: string };
  Terms: undefined;
  DatePicker: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  Pesanan: undefined;
  Armada: undefined;
  Alerts: undefined;
  Profil: undefined;
};

export type RenterTabParamList = {
  Home: undefined;
  Pesanan: undefined;
  Chat: undefined;
  Notifikasi: undefined;
  Profil: undefined;
};
