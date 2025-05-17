import React from "react";
import DonationDetailsScreen from "../screens/DonationDetailsScreen";
import EmergencyRequestScreen from "../screens/EmergencyRequestScreen";
import EmergencyStatusScreen from "../screens/EmergencyStatusScreen";
import TabNavigator from "./TabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BloodTypeDetailScreen from "../screens/BloodTypeDetailScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SecurityScreen from "../screens/profile/SecurityScreen";
import HelpScreen from "../screens/profile/HelpScreen";
import AboutScreen from "../screens/profile/AboutScreen";
import DonationScreen from "../screens/DonationScreen";
import BloodTypeListScreen from "../screens/BloodTypeListScreen";
import DonationHistoryScreen from "../screens/DonationHistoryScreen";
import NearbyScreen from '../screens/map/NearbyScreen';
import BlogListScreen from "../screens/blog/BlogListScreen";
import BlogDetailScreen from "../screens/blog/BlogDetailScreen";
import NotificationTestScreen from "../screens/NotificationTestScreen";

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
      <Stack.Screen name="DonationDetails" component={DonationDetailsScreen} />
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
