import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import DonorListScreen from '@/screens/nurse/DonorListScreen';
import GiftManagementScreen from '@/screens/nurse/GiftManagementScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HealthCheckList from '@/screens/nurse/healthCheck/HealthCheckList';
import DonationListScreen from '@/screens/nurse/donation/donationListScreen';

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
          title: "Check-in",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="HealthCheckList" 
        component={HealthCheckList}
        options={{
          title: "Khám sức khoẻ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medical-services" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Donations" 
        component={DonationListScreen}
        options={{
          title: "Hiến máu",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bloodtype" size={size} color={color} />
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