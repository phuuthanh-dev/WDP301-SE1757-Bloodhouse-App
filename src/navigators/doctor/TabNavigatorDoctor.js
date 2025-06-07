import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

// Import screens
import ProfileScreen from '@/screens/ProfileScreen';
import HealthCheckListScreen from '@/screens/doctor/healthCheck/HealthCheckPendingListScreen';
import BloodDonationListScreen from '@/screens/doctor/bloodSplit/BloodDonationListScreen';
import BloodUnitListScreen from '@/screens/doctor/bloodUnit/BloodUnitListScreen';
import DonorListScreen from '@/screens/doctor/DonorListScreen';
import ScannerScreen from '@/screens/nurse/ScannerScreen';

const Tab = createBottomTabNavigator();

// Custom Tab Button Component for Scanner
const ScannerTabButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -15,
      justifyContent: 'center',
      alignItems: 'center',
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#FF6B6B',
      shadowColor: '#FF6B6B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 3,
      borderColor: '#FFFFFF',
    }}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

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
        name="Scanner"
        component={ScannerScreen}
        initialParams={{ mode: 'smart', fromTab: true, userRole: 'doctor' }}
        options={{
          title: "Quét QR",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons 
              name="qr-code-scanner" 
              size={focused ? 32 : 28} 
              color="#FFFFFF" 
            />
          ),
          tabBarButton: (props) => <ScannerTabButton {...props} />,
          tabBarLabel: () => null, // Hide label for center tab
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