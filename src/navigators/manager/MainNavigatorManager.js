import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorManager from "./TabNavigatorManager";
import DonationListScreen from "@/screens/manager/dashboard/DonationListScreen";
import BloodInventoryScreen from "@/screens/manager/dashboard/BloodInventoryScreen";
import DonationRequestsScreen from "@/screens/manager/dashboard/DonationRequestsScreen";
import EmergencyRequestsScreen from "@/screens/manager/dashboard/EmergencyRequestsScreen";
import ReceiveRequestDetailScreen from "@/screens/manager/ReceiveRequestDetailScreen";
import ReceiveRequestListScreen from "@/screens/manager/dashboard/ReceiveRequestListScreen";
import SupportRequestListScreen from "@/screens/manager/dashboard/SupportRequestListScreen";
import SupportRequestDetailScreen from "@/screens/manager/SupportRequestDetailScreen";

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
      <Stack.Screen name="DonationList" component={DonationListScreen} />
      <Stack.Screen name="BloodInventory" component={BloodInventoryScreen} />
      <Stack.Screen name="DonationRequests" component={DonationRequestsScreen} />
      <Stack.Screen name="EmergencyRequests" component={EmergencyRequestsScreen} />
      <Stack.Screen name="ReceiveRequestDetailScreen" component={ReceiveRequestDetailScreen} />
      <Stack.Screen name="ReceiveRequestList" component={ReceiveRequestListScreen} />
      <Stack.Screen name="SupportRequestList" component={SupportRequestListScreen} />
      <Stack.Screen name="SupportRequestDetail" component={SupportRequestDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorManager;
