import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';
import DonorListScreen from '@/screens/nurse/DonorListScreen';
import ScannerScreen from '@/screens/nurse/ScannerScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HealthCheckList from '@/screens/nurse/healthCheck/HealthCheckList';
import DonationListScreen from '@/screens/nurse/donation/donationListScreen';

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
        name="HealthChecks" 
        component={HealthCheckList}
        options={{
          title: "Khám sức khoẻ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medical-services" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scanner"
        component={ScannerScreen}
        initialParams={{ mode: 'checkin', fromTab: true }}
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