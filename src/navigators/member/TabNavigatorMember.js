import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Import screens
import HomeScreen from '@/screens/member/HomeScreen';
import SearchScreen from '@/screens/member/facility/SearchScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import BloodCompatibilityScreen from '@/screens/member/bloodCompatibility/BloodCompatibilityScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigatorMember() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
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
        name="Trang chủ" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tương thích" 
        component={BloodCompatibilityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bloodtype" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tìm kiếm" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
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
} 