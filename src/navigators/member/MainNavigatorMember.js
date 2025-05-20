import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DonationScreen from "@/screens/member/donation/DonationScreen";
import BloodTypeDetailScreen from "@/screens/member/bloodType/BloodTypeDetailScreen";
import BloodTypeListScreen from "@/screens/member/bloodType/BloodTypeListScreen";
import BlogDetailScreen from "@/screens/member/blog/BlogDetailScreen";
import BlogListScreen from "@/screens/member/blog/BlogListScreen";
import EditProfileScreen from "@/screens/profile/EditProfileScreen";
import SecurityScreen from "@/screens/profile/SecurityScreen";
import HelpScreen from "@/screens/profile/HelpScreen";
import AboutScreen from "@/screens/profile/AboutScreen";
import NearbyScreen from "@/screens/map/NearbyScreen";
import DonationHistoryScreen from "@/screens/member/profile/DonationHistoryScreen";
import EmergencyStatusScreen from "@/screens/member/emergency/EmergencyStatusScreen";
import EmergencyRequestScreen from "@/screens/member/emergency/EmergencyRequestScreen";
import FacilityDetailScreen from "@/screens/member/facility/FacilityDetailScreen";
import TabNavigatorMember from "./TabNavigatorMember";

const MainNavigatorMember = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigatorMember} />
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

export default MainNavigatorMember;
