import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, Car, ClipboardList, LayoutDashboard, MessageCircle } from 'lucide-react-native';
import { OwnerTabParamList } from './types';
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerOrdersScreen from '../screens/owner/OwnerOrdersScreen';
import OwnerFleetScreen from '../screens/owner/OwnerFleetScreen';
import OwnerAlertsScreen from '../screens/owner/OwnerAlertsScreen';
import ChatListScreen from '../screens/renter/ChatListScreen';
import { colors } from '../theme/colors';
import { useAuth } from '../features/auth/useAuth';
import { useUnreadNotificationsCount } from '../hooks/useNotifications';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const icons = {
  Dashboard: LayoutDashboard,
  Pesanan: ClipboardList,
  Armada: Car,
  Chat: MessageCircle,
  Alerts: Bell,
};

export default function OwnerTabs() {
  const { user } = useAuth();
  const unreadCount = useUnreadNotificationsCount(user?.id);

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
      <Tab.Screen
        name="Alerts"
        component={OwnerAlertsScreen as any}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, fontSize: 10 },
        }}
      />
    </Tab.Navigator>
  );
}
