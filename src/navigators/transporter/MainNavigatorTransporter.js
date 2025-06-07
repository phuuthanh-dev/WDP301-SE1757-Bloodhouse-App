import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorTransporter from "./TabNavigatorTransporter";
import DeliveryDetailScreen from "@/screens/transporter/DeliveryDetailScreen";
import DeliveryMapScreen from "@/screens/transporter/DeliveryMapScreen";
import DeliveryReportScreen from "@/screens/transporter/DeliveryReportScreen";
import QRScannerScreen from "@/screens/transporter/QRScannerScreen";

const MainNavigatorTransporter = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigatorTransporter" component={TabNavigatorTransporter} />
      <Stack.Screen 
        name="DeliveryDetail" 
        component={DeliveryDetailScreen}
        options={{
          headerTintColor: "#2D3436",
        }}
      />
      <Stack.Screen 
        name="DeliveryMap" 
        component={DeliveryMapScreen}
        options={{
          headerTintColor: "#2D3436",
        }}
      />
      <Stack.Screen 
        name="DeliveryReport" 
        component={DeliveryReportScreen}
        options={{
          headerTintColor: "#2D3436",
        }}
      />
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{
          headerTintColor: "#2D3436",
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigatorTransporter;
