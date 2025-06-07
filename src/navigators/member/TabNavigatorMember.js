import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

// Import screens
import HomeScreen from '@/screens/member/HomeScreen';
import SearchScreen from '@/screens/member/facility/SearchScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import BloodCompatibilityScreen from '@/screens/member/bloodCompatibility/BloodCompatibilityScreen';
import NotificationsScreen from '@/screens/member/notification/NotificationsScreen';

const Tab = createBottomTabNavigator();

const DonationButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.donationButton}
      onPress={onPress}
    >
      <View style={styles.donationButtonInner}>
        <FontAwesome5 name="hand-holding-medical" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

export default function TabNavigatorMember() {
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
        name="Trang chủ" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
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
        name="Hiến máu" 
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarButton: (props) => (
            <DonationButton
              onPress={() => navigation.navigate('Donation')}
            />
          ),
        })}
      />
      <Tab.Screen 
        name="Thông báo" 
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
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

const styles = StyleSheet.create({
  donationButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donationButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 