import React from "react";
import TabNavigator from "./TabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DonationScreen from "@/screens/DonationScreen";
import BloodTypeDetailScreen from "@/screens/bloodType/BloodTypeDetailScreen";
import BloodTypeListScreen from "@/screens/bloodType/BloodTypeListScreen";
import BlogDetailScreen from "@/screens/blog/BlogDetailScreen";
import BlogListScreen from "@/screens/blog/BlogListScreen";
import EditProfileScreen from "@/screens/profile/EditProfileScreen";
import SecurityScreen from "@/screens/profile/SecurityScreen";
import HelpScreen from "@/screens/profile/HelpScreen";
import AboutScreen from "@/screens/profile/AboutScreen";
import NearbyScreen from "@/screens/map/NearbyScreen";
import DonationHistoryScreen from "@/screens/DonationHistoryScreen";
import EmergencyStatusScreen from "@/screens/EmergencyStatusScreen";
import EmergencyRequestScreen from "@/screens/EmergencyRequestScreen";
import FacilityDetailScreen from "@/screens/FacilityDetailScreen";

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
      <Stack.Screen name="Donation" component={DonationScreen} />
      <Stack.Screen name="EmergencyRequest" component={EmergencyRequestScreen} />
      <Stack.Screen name="EmergencyStatus" component={EmergencyStatusScreen} />
      <Stack.Screen name="BloodTypeDetail" component={BloodTypeDetailScreen} />
      <Stack.Screen name="BloodTypeList" component={BloodTypeListScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="BlogList" component={BlogListScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Nearby" component={NearbyScreen} />
      <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
