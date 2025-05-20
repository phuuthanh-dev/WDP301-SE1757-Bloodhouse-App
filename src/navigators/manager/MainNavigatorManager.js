import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorManager from "./TabNavigatorManager";
import DonorListScreen from "@/screens/manager/DonorListScreen";
import BloodInventoryScreen from "@/screens/manager/BloodInventoryScreen";
import DonationRequestsScreen from "@/screens/manager/DonationRequestsScreen";
import EmergencyRequestsScreen from "@/screens/manager/EmergencyRequestsScreen";

const MainNavigatorManager = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigatorManager} />
      <Stack.Screen name="DonorList" component={DonorListScreen} />
      <Stack.Screen name="BloodInventory" component={BloodInventoryScreen} />
      <Stack.Screen name="DonationRequests" component={DonationRequestsScreen} />
      <Stack.Screen name="EmergencyRequests" component={EmergencyRequestsScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorManager;
