import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import ProfileScreen from '@/screens/ProfileScreen';
import ManageRequestsScreen from '@/screens/manager/ManageRequestsScreen';
import ManageStaffsScreen from '@/screens/manager/ManageStaffsScreen';
import DashboardScreen from '@/screens/manager/DashboardScreen';

const Tab = createBottomTabNavigator();

const TabNavigatorManager = () => {
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
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Yêu cầu"
        component={ManageRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nhân viên" 
        component={ManageStaffsScreen}
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

export default TabNavigatorManager; 