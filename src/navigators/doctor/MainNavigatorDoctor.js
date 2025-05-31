import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorDoctor from "./TabNavigatorDoctor";

// Health Check Screens
import HealthCheckListScreen from "@/screens/doctor/healthCheck/HealthCheckPendingListScreen";
import HealthCheckUpdateScreen from "@/screens/doctor/healthCheck/HealthCheckUpdateScreen";

// Blood Donation Screens
import BloodUnitSplitScreen from "@/screens/doctor/bloodSplit/BloodUnitSplitScreen";
import BloodUnitUpdateScreen from "@/screens/doctor/bloodUnit/BloodUnitUpdateScreen";
import BloodUnitListScreen from "@/screens/doctor/bloodUnit/BloodUnitListScreen";

// Donor Screens
import DonorListScreen from "@/screens/doctor/DonorListScreen";
import DonorDetailScreen from "@/screens/doctor/DonorDetailScreen";

// Legacy screens (keeping for compatibility)
import DonorExaminationScreen from "@/screens/doctor/DonorExaminationScreen";
import PostDonationScreen from "@/screens/doctor/PostDonationScreen";
import DonorHistoryScreen from "@/screens/doctor/DonorHistoryScreen";

const MainNavigatorDoctor = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigatorDoctor" component={TabNavigatorDoctor} />
      
      {/* Health Check Flow */}
      <Stack.Screen name="HealthCheckList" component={HealthCheckListScreen} />
      <Stack.Screen name="HealthCheckUpdate" component={HealthCheckUpdateScreen} />
      
      {/* Blood Donation Flow */}
      <Stack.Screen name="BloodUnitSplit" component={BloodUnitSplitScreen} />
      <Stack.Screen name="BloodUnitUpdate" component={BloodUnitUpdateScreen} />
      <Stack.Screen name="BloodUnitList" component={BloodUnitListScreen} />
      
      {/* Donor Management Flow */}
      <Stack.Screen name="DonorList" component={DonorListScreen} />
      <Stack.Screen name="DonorDetail" component={DonorDetailScreen} />
      
      {/* Legacy screens */}
      <Stack.Screen name="DonorExamination" component={DonorExaminationScreen} />
      <Stack.Screen name="PostDonation" component={PostDonationScreen} />
      <Stack.Screen name="DonorHistory" component={DonorHistoryScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorDoctor;
