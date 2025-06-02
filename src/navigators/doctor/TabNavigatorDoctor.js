import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import ProfileScreen from '@/screens/ProfileScreen';
import HealthCheckListScreen from '@/screens/doctor/healthCheck/HealthCheckPendingListScreen';
import BloodDonationListScreen from '@/screens/doctor/bloodSplit/BloodDonationListScreen';
import BloodUnitListScreen from '@/screens/doctor/bloodUnit/BloodUnitListScreen';
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
          borderTopColor: '#E9ECEF',
          elevation: 10,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HealthChecks"
        component={HealthCheckListScreen}
        options={{
          tabBarLabel: 'Khám',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="stethoscope" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BloodDonations"
        component={BloodDonationListScreen}
        options={{
          tabBarLabel: 'Hiến máu',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="water" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BloodUnits"
        component={BloodUnitListScreen}
        options={{
          tabBarLabel: 'Xét nghiệm',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="test-tube" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={BloodDonationListScreen}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigatorDoctor; 