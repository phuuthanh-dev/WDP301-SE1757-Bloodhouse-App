import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import DonorListScreen from '@/screens/nurse/DonorListScreen';
import GiftManagementScreen from '@/screens/nurse/GiftManagementScreen';
import ScannerScreen from '@/screens/nurse/ScannerScreen';
import NotificationsScreen from '@/screens/nurse/NotificationsScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigatorNurse() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          elevation: 10,
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="DonorList" 
        component={DonorListScreen}
        options={{
          title: "Người Hiến",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="GiftManagement" 
        component={GiftManagementScreen}
        options={{
          title: "Quà Tặng",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="card-giftcard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{
          title: "Quét Mã",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: "Thông Báo",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: "Hồ Sơ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
} 