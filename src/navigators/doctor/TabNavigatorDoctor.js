import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import ProfileScreen from '@/screens/ProfileScreen';
import DoctorDashboardScreen from '@/screens/doctor/DoctorDashboardScreen';
import PostDonationScreen from '@/screens/doctor/PostDonationScreen';
import DonorListScreen from '@/screens/doctor/DonorListScreen';

const Tab = createBottomTabNavigator();

const TabNavigatorDoctor = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#95A5A6',
      }}
    >
      <Tab.Screen
        name="Trang chủ"
        component={DoctorDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Danh sách"
        component={DonorListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Hồ sơ" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigatorDoctor; 