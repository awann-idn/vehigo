import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, ClipboardList, Home, MessageCircle, User } from 'lucide-react-native';
import { RenterTabParamList } from './types';
import RenterHomeScreen from '../screens/renter/RenterHomeScreen';
import RenterOrdersScreen from '../screens/renter/RenterOrdersScreen';
import ChatListScreen from '../screens/renter/ChatListScreen';
import NotificationsScreen from '../screens/renter/NotificationsScreen';
import RenterProfileScreen from '../screens/renter/RenterProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<RenterTabParamList>();

const icons = {
  Home: Home,
  Pesanan: ClipboardList,
  Chat: MessageCircle,
  Notifikasi: Bell,
  Profil: User,
};

export default function RenterTabs() {
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
      <Tab.Screen name="Home" component={RenterHomeScreen as any} />
      <Tab.Screen name="Pesanan" component={RenterOrdersScreen as any} />
      <Tab.Screen name="Chat" component={ChatListScreen as any} />
      <Tab.Screen name="Notifikasi" component={NotificationsScreen as any} />
      <Tab.Screen name="Profil" component={RenterProfileScreen as any} />
    </Tab.Navigator>
  );
}
