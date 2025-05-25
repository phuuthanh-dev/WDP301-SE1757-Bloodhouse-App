import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorManager from "./TabNavigatorManager";
import DonorListScreen from "@/screens/manager/DonorListScreen";
import BloodInventoryScreen from "@/screens/manager/BloodInventoryScreen";
import DonationRequestsScreen from "@/screens/manager/DonationRequestsScreen";
import EmergencyRequestsScreen from "@/screens/manager/EmergencyRequestsScreen";
import ReceiveRequestDetailScreen from "@/screens/manager/ReceiveRequestDetailScreen";
import ReceiveRequestListScreen from "@/screens/manager/ReceiveRequestListScreen";
import EmergencyCampaignScreen from "@/screens/manager/EmergencyCampaignScreen";
import EmergencyCampaignDetailScreen from "@/screens/manager/EmergencyCampaignDetailScreen";

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
      <Stack.Screen name="ReceiveRequestDetailScreen" component={ReceiveRequestDetailScreen} />
      <Stack.Screen name="ReceiveRequestList" component={ReceiveRequestListScreen} />
      <Stack.Screen name="EmergencyCampaignScreen" component={EmergencyCampaignScreen} />
      <Stack.Screen name="EmergencyCampaignDetailScreen" component={EmergencyCampaignDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorManager;
