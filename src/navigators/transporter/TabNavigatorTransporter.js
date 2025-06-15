import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";
import ProfileScreen from "@/screens/ProfileScreen";
import DashboardScreen from "@/screens/transporter/DashboardScreen";
import DeliveryListScreen from "@/screens/transporter/DeliveryListScreen";
import QRScannerScreen from "@/screens/transporter/QRScannerScreen";
import NotificationsScreen from "@/screens/member/notification/NotificationsScreen";

const Tab = createBottomTabNavigator();

// Custom Tab Button Component for Scanner
const ScannerTabButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -30,
      justifyContent: "center",
      alignItems: "center",
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#FF6B6B",
      shadowColor: "#FF6B6B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 3,
      borderColor: "#FFFFFF",
    }}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

export default function TabNavigatorTransporter() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#95A5A6",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E9ECEF",
          elevation: 10,
          height: 65,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: "#FF6B6B",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DeliveryList"
        component={DeliveryListScreen}
        options={{
          title: "Đơn giao",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          tabBarButton: (props) => (
            <ScannerTabButton {...props}>
              <MaterialIcons name="qr-code-scanner" size={30} color="#FFFFFF" />
            </ScannerTabButton>
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationsScreen}
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
