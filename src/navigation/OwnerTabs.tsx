import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Car, ClipboardList, LayoutDashboard, MessageCircle, User } from 'lucide-react-native';
import { OwnerTabParamList } from './types';
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerOrdersScreen from '../screens/owner/OwnerOrdersScreen';
import OwnerFleetScreen from '../screens/owner/OwnerFleetScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';
import ChatListScreen from '../screens/renter/ChatListScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const icons = {
  Dashboard: LayoutDashboard,
  Pesanan: ClipboardList,
  Armada: Car,
  Chat: MessageCircle,
  Profil: User,
};

export default function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const Icon = icons[route.name];
          return <Icon size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={OwnerDashboardScreen as any} />
      <Tab.Screen name="Pesanan" component={OwnerOrdersScreen as any} />
      <Tab.Screen name="Armada" component={OwnerFleetScreen as any} />
      <Tab.Screen name="Chat" component={ChatListScreen as any} />
      <Tab.Screen name="Profil" component={OwnerProfileScreen as any} />
    </Tab.Navigator>
  );
}
