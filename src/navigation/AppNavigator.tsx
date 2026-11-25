import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import LogoSplashScreen from '../screens/LogoSplashScreen';
import SplashScreen from '../screens/SplashScreen';
import Onboarding1Screen from '../screens/Onboarding1Screen';
import Onboarding2Screen from '../screens/Onboarding2Screen';
import Onboarding3Screen from '../screens/Onboarding3Screen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PilihRoleScreen from '../screens/PilihRoleScreen';

import OwnerReg1Screen from '../screens/owner/registration/OwnerReg1Screen';
import OwnerReg2Screen from '../screens/owner/registration/OwnerReg2Screen';
import OwnerReg3Screen from '../screens/owner/registration/OwnerReg3Screen';
import OwnerReg4Screen from '../screens/owner/registration/OwnerReg4Screen';
import OwnerReg5Screen from '../screens/owner/registration/OwnerReg5Screen';
import OwnerVerificationScreen from '../screens/owner/OwnerVerificationScreen';
import OwnerBusinessProfileScreen from '../screens/owner/OwnerBusinessProfileScreen';
import OwnerOrderDetailScreen from '../screens/owner/OwnerOrderDetailScreen';
import OwnerVehicleDetailScreen from '../screens/owner/OwnerVehicleDetailScreen';
import OwnerAvailabilityScreen from '../screens/owner/OwnerAvailabilityScreen';
import OwnerAddVehicleScreen from '../screens/owner/OwnerAddVehicleScreen';
import OwnerChatDetailScreen from '../screens/owner/OwnerChatDetailScreen';

import SearchResultsScreen from '../screens/renter/SearchResultsScreen';
import DatePickerScreen from '../screens/renter/DatePickerScreen';
import VehicleDetailScreen from '../screens/renter/VehicleDetailScreen';
import MitraProfileScreen from '../screens/renter/MitraProfileScreen';
import ReviewsScreen from '../screens/renter/ReviewsScreen';
import BookingGatewayScreen from '../screens/renter/BookingGatewayScreen';
import BookingIdentityScreen from '../screens/renter/BookingIdentityScreen';
import BookingCheckoutScreen from '../screens/renter/BookingCheckoutScreen';
import BookingPaymentScreen from '../screens/renter/BookingPaymentScreen';
import TermsScreen from '../screens/renter/TermsScreen';
import RenterOrderDetailScreen from '../screens/renter/RenterOrderDetailScreen';
import InspectionScreen from '../screens/renter/InspectionScreen';
import RatingScreen from '../screens/renter/RatingScreen';
import ChatDetailScreen from '../screens/renter/ChatDetailScreen';
import RenterProfileEditScreen from '../screens/renter/RenterProfileEditScreen';
import RenterVerificationScreen from '../screens/renter/RenterVerificationScreen';
import AppSettingsScreen from '../screens/renter/AppSettingsScreen';
import HelpCenterScreen from '../screens/renter/HelpCenterScreen';

import OwnerTabs from './OwnerTabs';
import RenterTabs from './RenterTabs';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LogoSplash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="LogoSplash" component={LogoSplashScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
        <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
        <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="PilihRole" component={PilihRoleScreen} />

        <Stack.Screen name="OwnerReg1" component={OwnerReg1Screen} />
        <Stack.Screen name="OwnerReg2" component={OwnerReg2Screen} />
        <Stack.Screen name="OwnerReg3" component={OwnerReg3Screen} />
        <Stack.Screen name="OwnerReg4" component={OwnerReg4Screen} />
        <Stack.Screen name="OwnerReg5" component={OwnerReg5Screen} />
        <Stack.Screen name="OwnerVerification" component={OwnerVerificationScreen} />
        <Stack.Screen name="OwnerBusinessProfile" component={OwnerBusinessProfileScreen} />
        <Stack.Screen name="OwnerApp" component={OwnerTabs} />
        <Stack.Screen name="RenterApp" component={RenterTabs} />
        <Stack.Screen name="AdminApp" component={AdminDashboardScreen} />
        <Stack.Screen name="OwnerOrderDetail" component={OwnerOrderDetailScreen} />
        <Stack.Screen name="OwnerVehicleDetail" component={OwnerVehicleDetailScreen} />
        <Stack.Screen name="OwnerAvailability" component={OwnerAvailabilityScreen} />
        <Stack.Screen name="OwnerAddVehicle" component={OwnerAddVehicleScreen} />
        <Stack.Screen name="OwnerChatDetail" component={OwnerChatDetailScreen} />

        <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="DatePicker" component={DatePickerScreen} />
        <Stack.Screen name="MitraProfile" component={MitraProfileScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="BookingGateway" component={BookingGatewayScreen} />
        <Stack.Screen name="BookingIdentity" component={BookingIdentityScreen} />
        <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
        <Stack.Screen name="BookingPayment" component={BookingPaymentScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="RenterOrderDetail" component={RenterOrderDetailScreen} />
        <Stack.Screen name="Inspection" component={InspectionScreen} />
        <Stack.Screen name="Rating" component={RatingScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="RenterProfileEdit" component={RenterProfileEditScreen} />
        <Stack.Screen name="RenterVerification" component={RenterVerificationScreen} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
